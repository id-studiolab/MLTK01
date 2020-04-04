var gulp = require( 'gulp' );

const fs = require( 'fs' )
const jsdoc2md = require( 'jsdoc-to-markdown' )



gulp.task( 'generate-doc', ( done ) => {
  const output = jsdoc2md.renderSync( { files: 'library/*.js' } );
  fs.writeFileSync( 'docs/api.md', output );
  return done();
} )