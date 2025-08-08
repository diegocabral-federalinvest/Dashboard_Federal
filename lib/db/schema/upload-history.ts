import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  varchar, 
  timestamp, 
  text, 
  boolean,
  integer
} from 'drizzle-orm/pg-core';


export const uploadHistory = pgTable('upload_history', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  fileSize: integer('file_size').notNull(), // tamanho em bytes
  mimeType: varchar('mime_type', { length: 100 }),
  importedBy: varchar('imported_by', { length: 255 }).notNull(),
  importedAt: timestamp('imported_at').defaultNow().notNull(),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  recordsProcessed: integer('records_processed'),
  recordsFailed: integer('records_failed'),
  processingTime: integer('processing_time'), // tempo em milissegundos
});

export type UploadHistory = InferSelectModel<typeof uploadHistory>;
export type NewUploadHistory = InferInsertModel<typeof uploadHistory>; 