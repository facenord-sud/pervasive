// Défini des tâches utiles quand on développe l'application
// Pour le moment, les deux seuls tâches sont: 
// 1. Fournir un serveur HTTP (requis pour se connecter à elasticsearc)
// 2. Observer un changement dans un fichier html/css/javascript et de recharger la page dans le navigateur
// Dans la console, taper: grunt serve
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    connect: {
      server: {
        options: {
          port: 4567, // le numéro du port du serveur
          base: '.',
          livereload: true,
          open: true // au lancement de la tâche et à chaque rechargement, ouver la page. Mettre false pour désactiver
        }
      }
    },
    watch: { // Surveille les changement dans les fichiers listés ci-dessous
      options: {
        livereload: true
      },
      js: {
        files: [ 'js/*.js', 'vendor/**/*.js' ], // folder/**/*.extension indique tous les fichiers dans le dossier folder et ses sous-dossiers qui se terminent par extension
      },
      css: {
        files: [ 'css/**/*.css', 'vendor/**/*.css' ]
      },
      html: {
        files: [ 'index.html', 'partials/**/*.html']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  
  grunt.registerTask( 'serve', [ 'connect', 'watch' ] );

};