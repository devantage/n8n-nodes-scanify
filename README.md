![Logo](https://s3.devantage.com.br/devantage-public/logo-100x100.png)

# n8n-nodes-scanify

This is an n8n community node that works like a "CamScanner": it takes a photo of a document, detects its edges, corrects the perspective with [jscanify](https://github.com/puffinsoft/jscanify) (OpenCV.js) and returns a PDF or an image.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The published package's name is: `@devantage/n8n-nodes-scanify`

`jscanify` depends on `canvas` (a native module). npm usually downloads a prebuilt binary; if the n8n image has no compatible binary, install the build libraries (`cairo-dev pango-dev jpeg-dev giflib-dev` on Alpine) before installing the package.

## Operations

These are the currently available resources and it's respective operations.

### Document

- Scan Image

| Parameter               | Default | Description                                                                         |
| ----------------------- | ------- | ----------------------------------------------------------------------------------- |
| Input Binary Field      | `data`  | Binary field containing the image (JPG/PNG)                                         |
| Output Format           | `pdf`   | `pdf` (document inside a PDF page) or `image` (only the scanned image)              |
| Output Binary Field     | `data`  | Field where the result is written                                                   |
| File Name               | (empty) | Output file name. Empty uses the image name with the extension of the output format |
| Filter                  | `none`  | `none`, `grayscale` or `bw` (document mode, adaptive threshold)                     |
| Page Size               | `a4`    | PDF only. `a4`, `letter` or `image` (page sized to the image at 150 DPI)            |
| Margin (Pt)             | `0`     | PDF only. Page margin                                                               |
| Max Dimension (Px)      | `3000`  | Downscales large photos before processing                                           |
| JPEG Quality            | `85`    | Quality of the JPEG image (does not apply to `bw`, which uses PNG)                  |
| If No Document Detected | `error` | `error` or `original` (uses the whole photo)                                        |

With the `image` output format, the result is a JPEG, or a PNG when the `bw` filter is used.

The output JSON gets `scan.detected`, `scan.corners` (in original image pixels), `scan.width` and `scan.height`.

## Compatibility

The current version is compatible with n8n installations above v1.0.0.

## Usage

### How detection works

jscanify's built-in detection fails on textured backgrounds (granite, wood, fabric), because the document outline blends into the texture. So the node uses its own detection, running on the same OpenCV.js:

1. shrinks the image to about 800 px
2. uses morphological closing and opening to erase the document's text and the background texture
3. generates candidates from three masks (Otsu, inverted Otsu and Canny)
4. accepts only convex quadrilaterals and scores each one by the fraction of its perimeter that lies on real edges
5. picks the largest well-supported quadrilateral. If none qualifies, it falls back to jscanify's detection

Perspective correction (`extractPaper`) is still jscanify's. Set the `DEBUG_SCAN` environment variable to log the candidate quadrilaterals and their scores.

### Notes

- OpenCV.js is loaded once per process (about 1 s on the first run). Later runs reuse it.
- jscanify installs a simulated DOM (`global.document`, `global.Image`) in the n8n process. It caused no problems in testing, but it's worth knowing.
- Detection works best with the document on a contrasting background and all 4 edges visible.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [jscanify](https://github.com/puffinsoft/jscanify)
