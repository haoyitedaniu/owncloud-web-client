import { checkResponseStatus, request } from '../http'
import { User } from '../../types'
import join from 'join-path'
import { getPersonalSpaceId, getSpaceIdBySpaceName } from '../graph'
import { config } from '../../../config'
import { Response } from 'node-fetch'
import convert from 'xml-js'
import _ from 'lodash/object'

export const folderExists = async ({
  user,
  path
}: {
  user: User
  path: string
}): Promise<boolean> => {
  const getResponse = await request({
    method: 'GET',
    path,
    user: user
  })

  return getResponse.status === 200
}

const createFolder = async ({
  user,
  folder,
  webDavEndPathToRoot // the root of the WebDAV path. This is `spaces/<space-id>` for ocis or `files/<user>` for oC10
}: {
  user: User
  folder: string
  webDavEndPathToRoot: string
}): Promise<void> => {
  const paths = folder.split('/')

  let parentFolder = ''
  for (const resource of paths) {
    const path = join('remote.php', 'dav', webDavEndPathToRoot, parentFolder, resource)
    // check if the folder exists already or not
    const folderExist = await folderExists({ user, path })
    if (folderExist === false) {
      const response = await request({
        method: 'MKCOL',
        path,
        user: user
      })
      checkResponseStatus(response, 'Failed while creating folder')
    }
    parentFolder = join(parentFolder, resource)
  }
}
const createFile = async ({
  user,
  pathToFile,
  content,
  webDavEndPathToRoot // the root of the WebDAV path. This is `spaces/<space-id>` for ocis or `files/<user>` for oC10
}: {
  user: User
  pathToFile: string
  content?: string
  webDavEndPathToRoot: string
}): Promise<void> => {
  const response = await request({
    method: 'PUT',
    path: join('remote.php', 'dav', webDavEndPathToRoot, pathToFile),
    body: content,
    user: user,
    formatJson: false
  })

  checkResponseStatus(response, `Failed while uploading file '${pathToFile}' in personal space`)
}

export const uploadFileInPersonalSpace = async ({
  user,
  pathToFile,
  content
}: {
  user: User
  pathToFile: string
  content: string
}): Promise<void> => {
  // upload a file step is same for oc10 and ocis
  // so first need to determine the end path to make request
  const webDavEndPathToRoot = config.ocis
    ? 'spaces/' + (await getPersonalSpaceId({ user }))
    : 'files/' + user.id
  await createFile({ user, pathToFile, content, webDavEndPathToRoot })
}

export const createFolderInsideSpaceBySpaceName = async ({
  user,
  folder,
  spaceName
}: {
  user: User
  folder: string
  spaceName: string
}): Promise<void> => {
  const webDavEndPathToRoot =
    'spaces/' + (await getSpaceIdBySpaceName({ user, spaceType: 'project', spaceName }))
  await createFolder({ user, folder, webDavEndPathToRoot })
}

export const createFolderInsidePersonalSpace = async ({
  user,
  folder
}: {
  user: User
  folder: string
}): Promise<void> => {
  // creation of folder step is same for oc10 and ocis
  // so first need to determine the end point to make request
  const webDavEndPathToRoot = config.ocis
    ? 'spaces/' + (await getPersonalSpaceId({ user }))
    : 'files/' + user.id
  await createFolder({ user, folder, webDavEndPathToRoot })
}

export const uploadFileInsideSpaceBySpaceName = async ({
  user,
  pathToFile,
  spaceName
}: {
  user: User
  pathToFile: string
  spaceName: string
}): Promise<void> => {
  const webDavEndPathToRoot =
    'spaces/' + (await getSpaceIdBySpaceName({ user, spaceType: 'project', spaceName }))
  await createFile({ user, pathToFile, webDavEndPathToRoot })
}

export const getDataOfFileInsideSpace = async ({
  user,
  pathToFileName,
  spaceName
}: {
  user: User
  pathToFileName: string
  spaceName: string
}): Promise<Response> => {
  const body =
    '<?xml version="1.0"?>\n' +
    '<d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">\n' +
    '  <d:prop>\n' +
    '    <oc:permissions />\n' +
    '    <oc:favorite />\n' +
    '    <oc:fileid />\n' +
    '    <oc:file-parent />\n' +
    '    <oc:name />\n' +
    '    <oc:owner-id />\n' +
    '    <oc:owner-display-name />\n' +
    '    <oc:shareid />\n' +
    '    <oc:shareroot />\n' +
    '    <oc:share-types />\n' +
    '    <oc:privatelink />\n' +
    '    <d:getcontentlength />\n' +
    '    <oc:size />\n' +
    '    <d:getlastmodified />\n' +
    '    <d:getetag />\n' +
    '    <d:getcontenttype />\n' +
    '    <d:resourcetype />\n' +
    '    <oc:downloadURL />\n' +
    '  </d:prop>\n' +
    '</d:propfind>'
  const response = await request({
    method: 'PROPFIND',
    path: join(
      'remote.php',
      'dav',
      'spaces',
      await getSpaceIdBySpaceName({ user, spaceType: 'project', spaceName }),
      pathToFileName
    ),
    body: body,
    user: user
  })
  checkResponseStatus(response, `Failed while getting information of file ${pathToFileName}`)
  const fileData = JSON.parse(convert.xml2json(await response.text(), { compact: true }))
  return _.get(fileData, '[d:multistatus][d:response][d:propstat]')
}

export const getIdOfFileInsideSpace = async ({
  user,
  pathToFileName,
  spaceName
}: {
  user: User
  pathToFileName: string
  spaceName: string
}): Promise<string> => {
  const fileDataResponse = await getDataOfFileInsideSpace({
    user,
    pathToFileName,
    spaceName
  })
  // extract file id form the response
  return _.get(fileDataResponse, '[0][d:prop][oc:fileid]')._text
}
