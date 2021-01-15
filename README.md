Front-end Workflow
-----------
#### Front-end workflow with [Gulp](http://gulpjs.com/) , [BrowserSync](https://www.browsersync.io/) , [Pug](https://github.com/pugjs/pug) , [PostCSS](https://github.com/postcss/postcss) , [Browserify](http://browserify.org/)
> PostCSS Plugins: [cssnext](http://cssnext.io) , [lost](https://github.com/peterramsing/lost) , [import](https://github.com/postcss/postcss-import) , [reporter](https://github.com/postcss/postcss-reporter) , [rucksack](https://www.rucksackcss.org/) , [postcss-mixins](https://github.com/postcss/postcss-mixins) , [postcss-nested](https://github.com/postcss/postcss-nested)


Instruction
-----------
### 1. Global Install

1.  Install [Node.js](https://nodejs.org/en/) (for your platform).
2.  run `npm install --g gulp browser-sync browserify`.

### 2. Local Install

`git clone https://github.com/xowei/frontend-workflow.git`

Install dependencies `npm install`

### 3. Use

> src folder is **sources code** : contains Pug, PostCSS, Javascript, Javascript modules, fonts, images etc.

> dist folder is **for public** : contains HTML, CSS, javascript, fonts, compressed images etc.

- `gulp` or `npm run dev`: Start dev mode server. Local view: [http://127.0.0.1:3000/](http://127.0.0.1:3000/)

- `gulp --production` or `npm start`: run all the tasks. Compressed html, css and js and open server

- `gulp build --production` or `npm run build` run all the tasks. Compressed html, css and js without open server

---
- `gulp pug` Compile Pug to HTML
- `gulp css` Compile PostCSS to single CSS file named 'styles.css'
- `gulp js` Compile script.js with browserify to single javascript file named 'scripts.js'
- `gulp assets` copy fonts and compressed images
- `gulp`, `npm start` run all of the above task and open browser-sync server using production mode
- `gulp del` remove dist folder
