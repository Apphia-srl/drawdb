import { useCallback, useContext, useEffect, useState } from "react";
import { IdContext } from "../../Workspace";
import { useTranslation } from "react-i18next";
import { Spin, Steps, Tag, Toast } from "@douyinfe/semi-ui";
import { getCommits, getVersion } from "../../../api/diagrams";
import { DateTime } from "luxon";
import {
  useAreas,
  useDiagram,
  useEnums,
  useLayout,
  useNotes,
  useTransform,
  useTypes,
} from "../../../hooks";
import { DB } from "../../../data/constants";

export default function DiagramHistory({ diagramId, open, setTitle }) {
  const { setGistId, version, setVersion } = useContext(IdContext);
  const { setAreas } = useAreas();
  const { setLayout } = useLayout();
  const { setDatabase, setTables, setRelationships } = useDiagram();
  const { setNotes } = useNotes();
  const { setTypes } = useTypes();
  const { setEnums } = useEnums();
  const { setTransform } = useTransform();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersion, setLoadingVersion] = useState(null);

  const currentStep = versions.findIndex((v) => v.version === version);

  const loadVersion = useCallback(
    async (v) => {
      try {
        setLoadingVersion(v);
        const diagram = await getVersion(diagramId, v);
        setVersion(v);
        setLayout((prev) => ({ ...prev, readOnly: true }));

        setDatabase(diagram.database || DB.GENERIC);
        setGistId(diagram.gistId ?? "");
        setTitle(diagram.name);
        setTables(diagram.tables);
        setRelationships(diagram.references);
        setAreas(diagram.areas);
        setNotes(diagram.notes);
        setTransform({ pan: diagram.pan, zoom: diagram.zoom });
        setTypes(diagram.types ?? []);
        setEnums(diagram.enums ?? []);
      } catch (e) {
        console.error(e);
        Toast.error(t("failed_to_load_diagram"));
      } finally {
        setLoadingVersion(null);
      }
    },
    [
      diagramId,
      t,
      setVersion,
      setLayout,
      setDatabase,
      setGistId,
      setTitle,
      setTables,
      setRelationships,
      setAreas,
      setNotes,
      setTransform,
      setTypes,
      setEnums,
    ],
  );

  const fetchVersions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCommits(diagramId);
      setVersions(data);
    } catch (e) {
      console.error(e);
      Toast.error(t("oops_smth_went_wrong"));
    } finally {
      setIsLoading(false);
    }
  }, [diagramId, t]);

  useEffect(() => {
    if (diagramId && open) fetchVersions();
  }, [diagramId, open, fetchVersions]);

  return (
    <div className="mx-5 relative h-full">
      {!versions.length && !isLoading && (
        <div className="my-3">{t("no_saved_versions")}</div>
      )}
      {versions.length > 0 && (
        <div className="my-2 overflow-y-auto">
          <Steps direction="vertical" type="basic" current={currentStep}>
            {versions.map((r) => (
              <Steps.Step
                key={r.version}
                onClick={() => loadVersion(r.version)}
                className="group hover-1 first:!pt-2"
                title={<Tag>{r.version.substring(0, 7)}</Tag>}
                description={`${t("committed_at")} ${DateTime.fromISO(
                  r.committed_at,
                )
                  .setLocale(i18n.language)
                  .toLocaleString(DateTime.DATETIME_MED)}`}
                icon={
                  r.version === loadingVersion ? (
                    <Spin size="small" />
                  ) : (
                    <i className="text-sm fa-solid fa-asterisk ms-1" />
                  )
                }
              />
            ))}
          </Steps>
        </div>
      )}
      {isLoading && (
        <div className="text-blue-500 text-center my-3">
          <Spin size="middle" />
          <div>{t("loading")}</div>
        </div>
      )}
    </div>
  );
}
