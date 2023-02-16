var gulp = require('gulp');

const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');

gulp.task('generate-doc', done => {
  var jsdocOptions = {
    files: 'library/*.js', // specify where your files are
    template: fs.readFileSync('./docs/api-template.hbs', 'utf8'), // read a template file
    //template: "ciao",
    //template: '---\nlayout: default\ntitle: api\nnav_order: 5\n---\n\n#MLTK API\n\n***\n{{>main}}',
    'example-lang': 'js', // specify the "@example" code block language
    noCache: true, // Bypass caching
  };

  const output = jsdoc2md.render(jsdocOptions).then(output => fs.writeFileSync('docs/api.md', output));
  return done();
});
