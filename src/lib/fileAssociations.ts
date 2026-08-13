import type { BabbageAppManifestV1, BabbageDesktopFileV1 } from '../types/manifest'

const matchesExactly = (values: string[] | undefined, value: string) =>
  Boolean(values?.some((candidate) => candidate.toLowerCase() === value.toLowerCase()))

export const resolveFileApp = (
  file: BabbageDesktopFileV1,
  apps: BabbageAppManifestV1[]
): BabbageAppManifestV1 | undefined => {
  if (file.preferredAppId) {
    const preferred = apps.find((app) => app.id === file.preferredAppId)
    if (preferred) return preferred
  }
  const extension = file.extension ?? file.name.split('.').pop() ?? ''
  return apps.find((app) => app.fileAssociations?.some((association) =>
    matchesExactly(association.mimeTypes, file.mimeType) || matchesExactly(association.extensions, extension)
  )) ?? apps.find((app) => app.id === 'stuff')
}
