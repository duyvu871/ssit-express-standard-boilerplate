declare namespace Express {
    namespace Multer {
        interface File {
            metadata?: Record<string, unknown>;
        }
    }
}