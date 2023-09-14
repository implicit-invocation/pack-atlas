# pack-atlas

a simple atlas packer for Node.js

### How to use

You can use it globally with npx

```
npx pack-atlas <your-config-file>
```

`config-file` path is default to `packer.yaml`

Or your can install it as a development dependencies and use it with `npm run`

```
npm i -D pack-atlas
```

In your `package.json` file

```
{
  "scripts": {
    "pack-atlas": "pack-atlas"
  },
}
```

```
npm run pack-atlas
```

### Config file

```yaml
atlas_name:
  images: images/*.png # a glob to get the image files you want in your atlas
  outDir: atlas # the output directory, relative to the working direction
  maxWidth: 2048
  maxHeight: 2048
  padding: 2
  allowRotation: true # whether or not to allow rotate the image (either by 90 degrees or 0 degrees) to save space
  square: true
  smart: true
  filter: linear # only allow linear (for bilinear) and nearest for now
  trim: true # whether or not to allow trimming whitespaces in original images
```
