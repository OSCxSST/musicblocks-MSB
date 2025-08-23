# GIF Support in Music Blocks

Music Blocks now supports GIF files in media blocks! Here's what you need to know:

## Supported Image Formats

Music Blocks now supports the following image formats in Media blocks:

-   PNG
-   JPG/JPEG
-   **GIF** (including animated GIFs)
-   SVG
-   WebP

## How to Use GIF Files

1. **Using Media Block:**

    - Drag a "Media" block from the Media palette
    - Click on the block to open the file picker
    - Select your GIF file
    - The block will show a thumbnail of your GIF

2. **Using Show Block:**

    - Connect your Media block to a "Show" block
    - Set the size parameter as desired
    - Run your program to display the GIF on the canvas

3. **Using Avatar Block:**
    - Connect your Media block to an "Avatar" block
    - The GIF will be used as the mouse/turtle appearance

## Important Notes about Animated GIFs

-   **Animation Display:** Due to CreateJS library limitations, animated GIFs will typically display only the first frame when used in Music Blocks
-   **File Size:** Keep GIF files reasonably sized for better performance
-   **Performance:** Large animated GIFs may impact application performance

## Troubleshooting

If you encounter issues with GIF files:

1. **Check File Format:** Ensure the file is a valid GIF
2. **File Size:** Try with smaller GIF files if you experience issues
3. **Console Errors:** Check the browser console (F12) for any error messages
4. **Browser Support:** Ensure your browser supports the GIF format (most modern browsers do)

## Technical Details

The following improvements were made to support GIF files:

-   Updated file input to explicitly accept GIF files
-   Added error handling for image loading failures
-   Enhanced help text to mention GIF support
-   Added console logging for debugging

## Testing

You can test GIF support by:

1. Creating a simple project with a Media block
2. Loading a GIF file
3. Using it with Show or Avatar blocks
4. Verifying it displays correctly

For best results, start with small, simple GIF files before trying complex animated ones.
