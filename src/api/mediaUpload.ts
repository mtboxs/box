/**
 * 媒体上传工具函数
 */

/**
 * 生成6位随机字符串（字母+数字）
 */
export function generateUUID(): string {
  const chars
    = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 获取当前日期格式 YYYY-MM-DD
 */
export function getCurrentDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filePath: string): string {
  const lastDotIndex = filePath.lastIndexOf('.')
  return lastDotIndex === -1 ? '' : filePath.substring(lastDotIndex)
}

/**
 * 根据文件路径和类型智能确定扩展名
 * @param filePath 文件路径
 * @param fileType 文件类型
 */
export function getSmartExtension(
  filePath: string,
  fileType: 'image' | 'video',
): string {
  const extension = getFileExtension(filePath)

  console.log('getSmartExtension input:', {
    filePath,
    fileType,
    detectedExtension: extension,
  })

  // 如果是blob URL，不使用检测到的扩展名，直接使用默认值
  if (filePath.startsWith('blob:')) {
    console.log('Detected blob URL, using default extension for', fileType)
    if (fileType === 'image') {
      return '.jpg'
    }
    else if (fileType === 'video') {
      return '.mp4'
    }
  }

  // 如果有有效的扩展名（不包含路径分隔符），直接返回
  if (extension && !extension.includes('/') && extension.length <= 5) {
    console.log('Using detected extension:', extension)
    return extension
  }

  // 如果没有扩展名，根据文件类型返回默认扩展名
  if (fileType === 'image') {
    // 尝试从路径中检测图片格式关键字
    const lowerPath = filePath.toLowerCase()
    if (lowerPath.includes('png') || lowerPath.includes('image/png')) {
      console.log('Detected PNG from path')
      return '.png'
    }
    else if (lowerPath.includes('gif') || lowerPath.includes('image/gif')) {
      console.log('Detected GIF from path')
      return '.gif'
    }
    else if (lowerPath.includes('webp')) {
      console.log('Detected WEBP from path')
      return '.webp'
    }
    else {
      console.log('Using default .jpg extension')
      return '.jpg' // 默认为jpg
    }
  }
  else if (fileType === 'video') {
    console.log('Using default .mp4 extension')
    // 视频默认为mp4
    return '.mp4'
  }

  console.log('No extension determined, returning empty string')
  return ''
}

/**
 * 使用原生XMLHttpRequest模拟 curl 的 --data-binary
 * 以精准设置 Content-Type（如 image/jpeg、video/mp4）
 */
function uploadBinary(
  url: string,
  file: Blob,
  contentType: string,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)

    // 设置响应类型，让 DevTools 能正确显示
    xhr.responseType = 'text'

    // 设置请求头
    xhr.setRequestHeader('Content-Type', contentType)

    // 监听加载进度（可选）
    xhr.onprogress = function (event) {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        console.log(`Download progress: ${percentComplete.toFixed(2)}%`)
      }
    }

    xhr.onload = function () {
      console.log('Upload XHR onload:', {
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText,
        response: xhr.response,
        responseType: xhr.responseType,
        allHeaders: xhr.getAllResponseHeaders(),
      })

      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const data = xhr.responseText ? JSON.parse(xhr.responseText) : {}
          console.log('Parsed response data:', data)
          resolve({ statusCode: xhr.status, data, header: {} })
        }
        catch {
          console.log(
            'Failed to parse JSON, returning raw text:',
            xhr.responseText,
          )
          resolve({
            statusCode: xhr.status,
            data: xhr.responseText,
            header: {},
          })
        }
      }
      else {
        console.error('Upload failed with status:', xhr.status, xhr.statusText)
        reject({
          errMsg: `HTTP ${xhr.status}: ${xhr.statusText}`,
          statusCode: xhr.status,
          responseText: xhr.responseText,
        })
      }
    }

    xhr.onerror = function () {
      console.error('Network error during upload')
      reject({ errMsg: 'Network error', statusCode: 0 })
    }

    console.log('Sending file upload request:', {
      url,
      contentType,
      fileSize: file.size,
    })
    xhr.send(file)
  })
}

// 保留二进制上传方式 uploadBinary，multipart 方式已移除以避免未使用告警

/**
 * 上传响应接口
 */
export interface UploadResponse {
  url: string
  statusCode: number
  data?: any
  fileName?: string
  fileType?: string
}

/**
 * 上传媒体文件到服务器
 * @param fileOrPath File 对象或本地文件路径
 * @param fileType 文件类型 'image' | 'video'
 * @returns Promise<UploadResponse> 返回上传响应对象
 */
export function uploadMediaFile(
  fileOrPath: File | string,
  fileType: 'image' | 'video',
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    // 处理 File 对象
    if (fileOrPath instanceof File) {
      const file = fileOrPath
      const fileName = file.name
      const extension = getFileExtension(fileName)
      const uuid = generateUUID()
      const date = getCurrentDateString()

      // 路径前缀
      const pathPrefix = 'im'
      const contentType
        = file.type
          || (fileType === 'image' ? 'image/jpeg' : 'application/octet-stream')

      console.log('File upload info:', {
        fileName,
        extension,
        fileType,
        contentType,
        uuid,
      })

      const newFileName = `${uuid}${extension}`
      console.log('Generated fileName:', newFileName)

      // 直接上传到 R2
      const uploadUrl = `https://upload.faml99.com/upload?key=${pathPrefix}/${date}/${newFileName}`

      console.log('Attempting upload with:', {
        uploadUrl,
        fileName,
        contentType,
      })

      // 使用二进制上传以满足后端 Content-Type 要求
      uploadBinary(uploadUrl, file, contentType)
        .then((res: any) => {
          console.log('Binary upload success, full response:', res)
          // 使用服务器返回的URL，或者构造默认URL
          const fileUrl
            = res?.data?.url
              || `https://r2.faml99.com/${pathPrefix}/${date}/${newFileName}`
          console.log('Generated file URL:', fileUrl)

          const uploadResponse = {
            url: fileUrl,
            statusCode: res.statusCode || 200,
            data: res.data || {},
            fileName: newFileName,
            fileType,
          }
          console.log('Final upload response:', uploadResponse)
          resolve(uploadResponse)
        })
        .catch((err: any) => {
          console.error('Binary upload failed:', err)
          reject(err)
        })
    }
    else {
      // 处理文件路径（保持向后兼容）
      const filePath = fileOrPath
      const extension = getSmartExtension(filePath, fileType)
      const uuid = generateUUID()
      const date = getCurrentDateString()

      // 根据文件类型确定content-type和路径前缀
      let contentType = ''
      let pathPrefix = ''

      if (fileType === 'image') {
        // 根据扩展名确定content-type
        const ext = extension.toLowerCase()
        if (ext === '.png') {
          contentType = 'image/png'
        }
        else if (ext === '.gif') {
          contentType = 'image/gif'
        }
        else if (ext === '.webp') {
          contentType = 'image/webp'
        }
        else {
          contentType = 'image/jpeg' // jpg, jpeg等默认为jpeg
        }
        pathPrefix = 'im'
      }
      else if (fileType === 'video') {
        contentType = 'video/mp4'
        pathPrefix = 'im'
      }

      console.log('File info:', {
        filePath,
        extension,
        fileType,
        contentType,
        uuid,
      })

      const fileName = `${uuid}${extension}`
      console.log('Generated fileName:', fileName)
      // 直接上传到 R2
      const uploadUrl = `https://upload.faml99.com/upload?key=${pathPrefix}/${date}/${fileName}`

      console.log('Attempting upload with:', {
        uploadUrl,
        filePath,
        extension,
        contentType,
      })

      // 在H5环境下，尝试直接二进制上传（更接近 curl ）
      if (typeof window !== 'undefined' && window.XMLHttpRequest) {
        // H5环境：从filePath获取File对象
        // filePath在选择文件时实际是一个临时URL或File对象
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        fileInput.accept = fileType === 'image' ? 'image/*' : 'video/*'

        // 如果filePath是blob URL或File对象，尝试获取实际文件
        if (filePath.startsWith('blob:') || typeof filePath === 'object') {
          fetch(filePath)
            .then(response => response.blob())
            .then((blob) => {
              console.log(
                'Got blob for upload:',
                blob.size,
                'bytes, type:',
                blob.type,
              )
              return uploadBinary(
                uploadUrl,
                blob,
                contentType || blob.type || 'application/octet-stream',
              )
            })
            .then((res: any) => {
              console.log('Binary upload success:', res)
              // 使用服务器返回的URL
              const fileUrl
                = res?.data?.url
                  || `https://r2.faml99.com/${pathPrefix}/${date}/${fileName}`
              console.log('Generated file URL:', fileUrl)
              resolve({
                url: fileUrl,
                statusCode: res.statusCode || 200,
                data: res.data,
                fileName,
                fileType,
              })
            })
            .catch((err: any) => {
              console.error('Binary upload failed:', err)
              // 如果二进制上传失败，回退到uni.uploadFile
              fallbackToUniUpload()
            })
        }
        else {
          // 回退到uni.uploadFile
          fallbackToUniUpload()
        }
      }
      else {
        // 非H5环境，使用uni.uploadFile
        fallbackToUniUpload()
      }

      function fallbackToUniUpload() {
        console.log('Falling back to uni.uploadFile')
        if (
          typeof uni === 'undefined'
          || typeof uni.uploadFile !== 'function'
        ) {
          console.error('uni.uploadFile is not available')
          reject(new Error('Upload service is not available'))
          return
        }

        uni.uploadFile({
          url: uploadUrl,
          filePath,
          name: 'file',
          header: {
            // 让浏览器自动处理Origin头部
          },
          success: (res: any) => {
            console.log('Upload success:', res)
            if (res.statusCode == 200 || res.statusCode == 201) {
              const fileUrl = `https://r2.faml99.com/${pathPrefix}/${date}/${fileName}`
              console.log('Generated file URL:', fileUrl)
              resolve({
                url: fileUrl,
                statusCode: res.statusCode,
                data: res.data,
                fileName,
                fileType,
              })
            }
            else {
              console.error(
                'Upload failed with status:',
                res.statusCode,
                'response:',
                res.data,
              )
              reject(new Error(`Upload failed with status: ${res.statusCode}`))
            }
          },
          fail: (err: any) => {
            console.error('Upload failed:', err)
            reject(
              new Error(`Upload failed: ${err.errMsg || 'Unknown error'}`),
            )
          },
        })
      }
    }
  })
}

/**
 * 压缩图片
 * @param filePath 图片路径
 * @param quality 压缩质量 0-100
 * @returns Promise<string> 压缩后的图片路径
 */
declare const uni: any
export function compressImage(
  filePath: string,
  quality: number = 80,
): Promise<string> {
  return new Promise((resolve, _reject) => {
    // 检查是否支持压缩API
    if (typeof uni.compressImage === 'function') {
      uni.compressImage({
        src: filePath,
        quality,
        success: (res: any) => {
          resolve(res.tempFilePath)
        },
        fail: (err: any) => {
          console.error('Image compression failed:', err)
          // 压缩失败则使用原图
          resolve(filePath)
        },
      })
    }
    else {
      // 如果不支持压缩，直接使用原图
      console.log('uni.compressImage is not supported, using original image')
      resolve(filePath)
    }
  })
}

/**
 * 创建媒体消息对象
 * @param type 媒体类型 'img' | 'video'
 * @param url 媒体URL
 * @returns 消息字符串
 */
export function createMediaMessage(type: 'img' | 'video', url: string): string {
  return JSON.stringify({
    v: 1,
    t: type,
    u: url,
  })
}

/**
 * 解析媒体消息
 * @param message 消息字符串
 * @returns 解析后的消息对象或null
 */
export function parseMediaMessage(
  message: string,
): { v: number, t: string, u: string } | null {
  try {
    const parsed = JSON.parse(message)
    if (parsed && parsed.v === 1 && parsed.t && parsed.u) {
      return parsed
    }
    return null
  }
  catch {
    return null
  }
}

/**
 * 判断是否为媒体消息
 * @param message 消息字符串
 * @returns boolean
 */
export function isMediaMessage(message: string): boolean {
  return parseMediaMessage(message) !== null
}
