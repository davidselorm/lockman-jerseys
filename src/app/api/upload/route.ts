import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { createAdminClient, createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

export async function POST(request: Request) {
  try {
    // 1. Enforce admin authentication
    const session = await getAdminSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';
    let buffer: Buffer | null = null;
    let fileName = `upload-${Date.now()}`;
    let mimeType = 'image/jpeg';
    let bucket = 'jerseys';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { dataUrl, bucket: requestedBucket, filename } = body;

      if (!dataUrl) {
        return NextResponse.json({ error: 'dataUrl is required' }, { status: 400 });
      }

      if (requestedBucket) {
        bucket = requestedBucket === 'jerseys' ? 'jerseys' : 'proofs';
      }

      // Parse base64 DataURL: "data:image/png;base64,iVBORw0KGgo..."
      const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(dataUrl, 'base64');
      }

      const extension = mimeType.split('/')[1] || 'jpg';
      fileName = filename ? `${Date.now()}-${filename}` : `upload-${Date.now()}.${extension}`;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const requestedBucket = formData.get('bucket') as string | null;

      if (!file) {
        return NextResponse.json({ error: 'File is required' }, { status: 400 });
      }

      if (requestedBucket) {
        bucket = requestedBucket === 'jerseys' ? 'jerseys' : 'proofs';
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      mimeType = file.type || 'image/jpeg';
      const extension = file.name.split('.').pop() || 'jpg';
      fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    } else {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
    }

    if (!buffer) {
      return NextResponse.json({ error: 'Empty file payload' }, { status: 400 });
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed limit (5MB)' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid file format. Allowed formats: JPEG, PNG, WebP, AVIF' }, { status: 400 });
    }

    // If Supabase Storage is configured, upload to bucket
    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || createClient();
      if (supabase) {
        const filePath = `${fileName}`;
        const { data, error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (uploadErr) {
          console.error(`Supabase storage upload error in bucket "${bucket}":`, uploadErr);
          // If storage bucket isn't created yet, fall back gracefully to data URL
          const fallbackDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
          return NextResponse.json({
            success: true,
            url: fallbackDataUrl,
            warning: `Supabase upload failed: ${uploadErr.message}. Ensure bucket "${bucket}" exists.`,
          });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          path: filePath,
        });
      }
    }

    // Local fallback: return base64 DataURL
    const localDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    return NextResponse.json({
      success: true,
      url: localDataUrl,
      mode: 'local',
    });
  } catch (err: any) {
    console.error('API upload error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
