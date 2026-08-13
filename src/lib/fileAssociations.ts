import type { BabbageAppManifestV1, BabbageDesktopFileV1 } from '../types/manifest'

const matchesExactly = (values: string[] | undefined, value: string) =>
  Boolean(values?.some((candidate) => candidate.toLowerCase() === value.toLowerCase()))

const matchesWildcard = (values: string[] | undefined, value: string) =>
  Boolean(values?.some((candidate) => candidate === '*' || candidate === '*/*' ||
    (candidate.endsWith('/*') && value.toLowerCase().startsWith(candidate.slice(0, -1).toLowerCase()))))

export const resolveFileApp = (
  file: BabbageDesktopFileV1,
  apps: BabbageAppManifestV1[]
): BabbageAppManifestV1 | undefined => {
  if (file.preferredAppId) {
    const preferred = apps.find((app) => app.id === file.preferredAppId)
    if (preferred) return preferred
  }
  const extension = file.extension ?? file.name.split('.').pop() ?? ''
  const exact = apps.find((app) => app.fileAssociations?.some((association) =>
    matchesExactly(association.mimeTypes, file.mimeType) || matchesExactly(association.extensions, extension)
  ))
  if (exact) return exact
  return apps.find((app) => app.id === 'stuff') ?? apps.find((app) => app.fileAssociations?.some((association) =>
    matchesWildcard(association.mimeTypes, file.mimeType) || matchesWildcard(association.extensions, extension)
  ))
}
