
module.exports = (grunt) => {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        realFavicon: {
    		favicons: {
    			src: 'assets/favicon/logo.jpg',
    			dest: 'bin/favicons/',
    			options: {
    				iconsPath: '/bin/favicons/',
    				html: [ 'views/partials/_favicons.hbs'],
    				design: {
    					ios: {
    						pictureAspect: 'backgroundAndMargin',
    						backgroundColor: '#ffffff',
    						margin: '14%',
    						assets: {
    							ios6AndPriorIcons: true,
    							ios7AndLaterIcons: true,
    							precomposedIcons: false,
    							declareOnlyDefaultIcon: false
    						}
    					},
    					desktopBrowser: {},
                        coast: {
                          pictureAspect: 'backgroundAndMargin',
                          backgroundColor: '#ffffff',
                          margin: '12%'
                        },
                        openGraph: {
                          pictureAspect: 'backgroundAndMargin',
                          backgroundColor: '#ffffff',
                          margin: '8%',
                          ratio: '1.91:1',
                          siteUrl: "http://example.com/"
                        },
                        "yandex_browser": {
            				"background_color": "#ffffff",
            				"manifest": {
            					"show_title": true,
            					"version": "1.0"
            				}
            			},
                        "firefox_app": {
            				"picture_aspect": "circle",
            				"keep_picture_in_circle": "true",
            				"circle_inner_margin": "5",
            				"background_color": "#ffffff",
            				"manifest": {
            					"app_name": "Webpack app",
            					"app_description": "Yet another sample application",
            					"developer_name": "Dom Talbot",
            					"developer_url": "http://djt.io"
            				}
            			},
    					windows: {
    						pictureAspect: 'noChange',
    						backgroundColor: '#017143',
    						onConflict: 'override',
    						assets: {
    							windows80Ie10Tile: true,
    							windows10Ie11EdgeTiles: {
    								small: true,
    								medium: true,
    								big: true,
    								rectangle: true
    							}
    						}
    					},
    					androidChrome: {
    						pictureAspect: 'noChange',
    						themeColor: '#ffffff',
    						manifest: {
    							name: 'webpack test',
    							display: 'standalone',
    							orientation: 'notSet',
    							onConflict: 'override',
    							declared: true
    						},
    						assets: {
    							legacyIcon: false,
    							lowResolutionIcons: true
    						}
    					},
    					/*safariPinnedTab: {
    						pictureAspect: 'blackAndWhite',
    						threshold: 93.28125,
    						themeColor: '#017143'
    					}*/
    				},
    				settings: {
    					compression: 2,
    					scalingAlgorithm: 'Mitchell',
    					errorOnImageTooSmall: false
    				},
    				versioning: {
    					paramName: 'v',
    					paramValue: '00rzARYN6M'
    				}
    			}
    		}
    	},
    });
    grunt.registerTask('default', ['realFavicon']);
}
