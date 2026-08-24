import { useMemo } from "react";
import ExtensionsContext from "./ExtensionsContext";
import * as diagramsApi from "../api/diagrams";
import { db } from "../data/db";

function rememberDiagram(diagram) {
  return db.cloudDiagrams.put({
    diagramId: diagram.diagramId,
    name: diagram.name ?? "",
    database: diagram.database || "generic",
    lastModified: diagram.lastModified ?? new Date(),
    sizeBytes: JSON.stringify(diagram).length,
  });
}

export default function CloudExtensionsProvider({ children }) {
  const value = useMemo(
    () => ({
      cloudList: () => db.cloudDiagrams.toArray(),
      cloudLoad: async (id) => {
        try {
          const diagram = await diagramsApi.get(id);
          await rememberDiagram(diagram);
          return { ...diagram, canWrite: true };
        } catch (e) {
          if (e.response?.status === 404) return null;
          throw e;
        }
      },
      cloudSave: async (payload) => {
        await diagramsApi.save(payload.diagramId, payload);
        await rememberDiagram(payload);
      },
      cloudDelete: async (id) => {
        await diagramsApi.del(id);
        await db.cloudDiagrams.delete(id);
      },
    }),
    [],
  );

  return (
    <ExtensionsContext.Provider value={value}>
      {children}
    </ExtensionsContext.Provider>
  );
}
