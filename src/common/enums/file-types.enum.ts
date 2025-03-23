export enum FileType {
    // Images
    JPEG = 'image/jpeg',
    PNG = 'image/png',
    GIF = 'image/gif',
    WEBP = 'image/webp',
    SVG = 'image/svg+xml',

    // Documents
    PDF = 'application/pdf',
    DOC = 'application/msword',
    DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS = 'application/vnd.ms-excel',
    XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT = 'application/vnd.ms-powerpoint',
    PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

    // Archives
    ZIP = 'application/zip',
    RAR = 'application/x-rar-compressed',
    _7Z = 'application/x-7z-compressed',

    // Text
    TXT = 'text/plain',
    CSV = 'text/csv',
    JSON = 'application/json',
    XML = 'application/xml'
}

export const MAX_FILE_SIZES: { [key in FileType]: number } = {
    // Images (10MB)
    [FileType.JPEG]: 10 * 1024 * 1024,
    [FileType.PNG]: 10 * 1024 * 1024,
    [FileType.GIF]: 10 * 1024 * 1024,
    [FileType.WEBP]: 10 * 1024 * 1024,
    [FileType.SVG]: 5 * 1024 * 1024,

    // Documents (25MB)
    [FileType.PDF]: 25 * 1024 * 1024,
    [FileType.DOC]: 25 * 1024 * 1024,
    [FileType.DOCX]: 25 * 1024 * 1024,
    [FileType.XLS]: 25 * 1024 * 1024,
    [FileType.XLSX]: 25 * 1024 * 1024,
    [FileType.PPT]: 25 * 1024 * 1024,
    [FileType.PPTX]: 25 * 1024 * 1024,

    // Archives (50MB)
    [FileType.ZIP]: 50 * 1024 * 1024,
    [FileType.RAR]: 50 * 1024 * 1024,
    [FileType._7Z]: 50 * 1024 * 1024,

    // Text (5MB)
    [FileType.TXT]: 5 * 1024 * 1024,
    [FileType.CSV]: 5 * 1024 * 1024,
    [FileType.JSON]: 5 * 1024 * 1024,
    [FileType.XML]: 5 * 1024 * 1024
};