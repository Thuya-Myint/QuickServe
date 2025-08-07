// supabaseService.js
const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Upload a file to Supabase Storage
 * @param {Object} options
 * @param {Buffer|Blob} options.file - File data (Buffer for Node.js)
 * @param {string} options.folder - Folder path in bucket (e.g., "avatars", "invoices")
 * @param {string} options.filename - Name of file to store (e.g., "image.png")
 * @param {string} [options.bucket='uploads'] - Supabase bucket name
 * @param {string} [options.contentType='application/octet-stream'] - MIME type
 * @param {boolean} [options.upsert=true] - Whether to overwrite if exists
 * @returns {Promise<{ publicUrl: string, path: string }>}
 */
async function uploadToSupabase({
    file,
    folder,
    filename,
    bucket = 'shomyn',
    contentType = 'application/octet-stream',
    upsert = true,
}) {
    if (!file || !folder || !filename) {
        throw new Error('Missing required parameters: file, folder, or filename.')
    }

    const filePath = `${folder}/${filename}`

    const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            contentType,
            upsert,
        })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return {
        publicUrl: data.publicUrl,
        path: filePath,
    }
}

module.exports = {
    uploadToSupabase,
}
