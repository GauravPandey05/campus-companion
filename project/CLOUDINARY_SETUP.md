# 🔥 Cloudinary Setup Instructions

## Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/
2. Sign up for a free account
3. Verify your email

## Step 2: Get Your Credentials
1. Go to your Cloudinary Dashboard
2. Copy the following details:
   - Cloud Name
   - API Key (for reference, but not needed for browser uploads)

## Step 3: Create Upload Preset
1. Go to Settings > Upload
2. Click "Add upload preset"
3. Set the following:
   - Upload preset name: `campus-companion-upload`
   - Signing Mode: `Unsigned` (IMPORTANT: Must be unsigned for browser uploads)
   - Folder: `campus-companion`
   - Resource type: `Auto`
   - Access control: `Public readable`
4. Save the preset

## Step 4: Update Environment Variables
1. Create a `.env` file in your project root
2. Copy the contents from `.env.example`
3. Replace the Cloudinary values with your actual credentials:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
VITE_CLOUDINARY_API_KEY=your_actual_api_key
VITE_CLOUDINARY_UPLOAD_PRESET=campus-companion-upload
```

**Note:** We removed `API_SECRET` as it's not needed for browser-based uploads and poses a security risk.

## Step 5: Test the Upload
1. Run `npm run dev`
2. Navigate to the Upload Notes page
3. Try uploading a file to test the integration

## Security Note
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- For production, set these as environment variables on your hosting platform
