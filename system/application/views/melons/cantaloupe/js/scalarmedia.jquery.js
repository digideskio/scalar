/**
 * Scalar
 * Copyright 2013 The Alliance for Networking Visual Culture.
 * http://scalar.usc.edu/scalar
 * Alliance4NVC@gmail.com
 *
 * Licensed under the Educational Community License, Version 2.0
 * (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.osedu.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

(function($) {

	$.scalarmedia = function(m, e, options) {

		var mediaelement = m;
		var element = e;

		var media = {

			options: $.extend({
				'shy':true,
				'details': null,
				'caption': 'description'
			}, options),

			showAnnotation: function(e, relation, m, forceShow) {

				// make sure this is the right mediaelement
				if ( mediaelement.model.id == m.model.id ) {

					// and that we already know about the annotation
					if (annotations.indexOf(relation) != -1) {
						var currentAnnotationTable = currentAnnotation.find('table');
						var annotationTable = annotationPane.find('table');

						// if the annotation isn't already highlighted or we're showing it no matter what, then
						if ((currentRelation != relation) || forceShow) {

							// if the annotation tab is hidden, then show the single annotation display
							if (annotationPane.css('display') == 'none') {
								currentAnnotationTable.empty();

								var row = $('<tr><td>'+relation.startString+'</td><td></td></tr>').appendTo(currentAnnotationTable);
								media.addContentForAnnotationToContainer( relation.body, row.find( 'td' ).eq( 1 ) );

								row.data('relation', relation);
								row.click(function( event ) {

									// only clicks on the background should cue up the annotation
									if ( $( event.target ).is( 'td,h4,div,p,tr' ) ) {
										var relation = $(this).data('relation');
										mediaelement.seek(relation);
										if (( relation.target.current.mediaSource.contentType != 'document' ) && ( relation.target.current.mediaSource.contentType != 'image' )) {
						       				setTimeout(function() {
						           				if(!mediaelement.is_playing()) {
													mediaelement.play();
						           				}
						       				},250);
										}
									}
								});

								currentAnnotation.slideDown();

							// otherwise, update the list of all annotations
							} else {
								
								$(annotationTable).find('tr').removeClass('current');
								$(annotationTable).find('tr').each(function() {

									var rowRelation = $(this).data('relation');
									var col = $(this).find('td').eq(1);
									

									if ( rowRelation != null ) {

										// show the content of the selected annotation
										if (rowRelation == relation) {

											$(this).addClass('current');

											// only rebuild the annotation content if it isn't already showing
											if ( $( '.media_annotations #anno-' + rowRelation.body.slug ).length == 0 ) {
												col.empty();
												media.addContentForAnnotationToContainer( rowRelation.body, col );
												page.addMediaElementsForElement( col );

											} else {
												col.find( 'h4' ).contents().wrap( '<a href="' + rowRelation.body.url + '"></a>' );
												col.find( 'h4' ).addClass( 'heading_weight' );
											}

											col.find('div').eq( 0 ).slideDown();

										// hide the content of all other annotations
										} else {
											col.find( 'h4 > a' ).contents().unwrap();
											col.find( 'h4' ).removeClass( 'heading_weight' );
											col.find( 'div' ).eq( 0 ).slideUp();
										}	
									}
								});
							}

							currentRelation = relation;

						} else {
							if (annotationPane.css('display') == 'none') {
								currentAnnotationTable.find('td').eq(0).text( relation.startString );
							}
						}
					}
				}
			},

			hideAnnotation: function(e, relation, m, forceHide) {

				if ( mediaelement.model.id == m.model.id ) {
					//if ((currentRelation != null) || forceHide) {

						if (annotationPane) {

							//console.log('hide '+((relation == null) ? 'null' : relation.body.getDisplayTitle())+' for '+mediaelement.model.node.getDisplayTitle());

							if (annotationPane.css('display') == 'none') {
								if (currentRelation == relation) {
									currentAnnotation.slideUp();
									currentRelation = null;
								}
							} else if (relation != null) {
								var annotationTable = annotationPane.find('table');
								//$(annotationTable).find('tr').removeClass('current');
								$(annotationTable).find('tr').each(function() {
									var rowRelation = $(this).data('relation');
									if (rowRelation == relation) {
										$(this).removeClass('current');
										if (rowRelation.body.current.content != null) {
											var col = $(this).find('td').eq(1);
											col.find('h4 > a').contents().unwrap();
											col.find('h4').removeClass( 'heading_weight' );
											col.find('div').eq(0).slideUp();
										}
									}
								});
								if (currentRelation == relation) currentRelation = null;
							}
						}
					//}
				}
			},

			addContentForAnnotationToContainer: function( annotation, container ) {

				var content, tag, tags, tagBar, tagItem, labelClass, i, n;

				// add the title
				container.append('<h4 class="heading_weight"><a href="' + annotation.url + '">'+ annotation.getDisplayTitle() +'</a></h4>');

				content = $( '<div id="anno-' + annotation.slug +'"></div>' ).appendTo( container );

				// add the annotation description
				nodeContent = $( '<p>' + annotation.getDescription() + '</p>' ).appendTo( content );

				// get incoming tags and display them as buttons
				tags = annotation.getRelatedNodes( "tag", "incoming" );
				n = tags.length;
				if ( n > 0 ) {
					tagBar = $( '<div class="mini-tag-bar">Tags:&nbsp; </div>' ).appendTo( content );
				}
				for ( i = 0; i < n; i++ ) {
					tagBar.append( " " );
					tag = tags[ i ];
					tagItem = $( '<a href="javascript:;" id="anno-tag-' + tag.slug + '" class="anno-tag btn btn-xs btn-default">' + tag.getDisplayTitle() + '</a>' ).appendTo( tagBar );
					tagItem.data( 'tag', tag );

					// when a tag button is clicked, toggle it on and all the others off,
					// and show its content below
					tagItem.click( function( event ) {
						event.preventDefault();
						var me = $( this );
						if ( me.hasClass( 'btn-primary' ) ) {
							me.parent().find( '.anno-tag' ).removeClass( 'btn-primary' ).addClass( 'btn-default' );
							me.parent().parent().find( '.anno-tag-content' ).empty();
						} else {
							$( this ).parent().find( '.anno-tag' ).removeClass( 'btn-primary' ).addClass( 'btn-default' );
							$( this ).removeClass( 'btn-default' );
							$( this ).addClass( 'btn-primary' );
							var tag = $( this ).data( 'tag' );
							var nodeContent = me.parent().parent().find( '.anno-tag-content' ).empty();
							nodeContent.append( tag.getDescription() );
						}
					})
				}
				if ( n > 0 ) {
					content.append( '<p class="anno-tag-content"></p>' );
				}

			},

			minimizeAnnotationPane: function() {
				if (annotationPane) {
					var annotationTable = annotationPane.find('table');
					$(annotationTable).find('tr').each(function() {
						var rowRelation = $(this).data('relation');
						var col = $(this).find('td').eq(1);
						col.empty();
						col.append('<p>'+rowRelation.body.getDisplayTitle()+'</p>');
					});
				}
			}

		}

		var node = mediaelement.model.node;

		//if (node.current.description != null) mediaelement.view.footer.append('<div><a class="media_info" href="javascript:;">i</a> '+node.current.description+'</div>');

		if (element != null) {
			var currentAnnotation = $('<div class="current_annotation"><table></table></div>').appendTo(element);

			var currentRelation = null;

			var mediaTabs = $('<div class="media_tabs"></div>').appendTo(element);

			var foundAuxContent = false;

			var description;
			switch ( media.options.caption ) {

				case 'title':
				description = node.getDisplayTitle();
				break;

				case 'title-and-description':
				if ( node.current.description != null ) {
					description = '<strong>' + node.getDisplayTitle() + '</strong><br>' + node.current.description;
				} else {
					description = node.getDisplayTitle();
				}
				break;

				default:
				description = node.current.description;
				if ( node.current.description == null ) {
					description = '<p><i>No description available.</i></p>';
				}
				break;

			}
			if ( media.options.caption != 'none' ) {
				if ( node.current.source != null ) {
					description += '<br><i>Source: ' + node.current.source + '</i>';
				}
				var descriptionPane = $('<div class="media_description pane">'+description+'</div>').appendTo(element);
				var descriptionTab = $('<div class="media_tab select">Description</div>').appendTo(mediaTabs);
				descriptionTab.click(function() {
					$(this).parent().parent().find('.pane').hide();
					media.minimizeAnnotationPane();
					descriptionPane.show();
					$(this).parent().find('.media_tab').removeClass('select');
					descriptionTab.addClass('select');
					if (currentRelation != null) {
						media.showAnnotation(null, currentRelation, mediaelement, true);
					}
				});
				element.find('.media_description').show();
			}
			foundAuxContent = true;

			var i, annotation, row, prop, value;
			var annotations = node.getRelations('annotation', 'incoming', 'index');
			if (annotations.length > 0) {
				var annotationTab = $('<div class="media_tab">Annotations</div>').appendTo(mediaTabs);
				annotationTab.click(function() {
					$(this).parent().parent().find('.pane').hide();
					annotationPane.show();
					$(this).parent().find('.media_tab').removeClass('select');
					annotationTab.addClass('select');
					if (currentRelation != null) {
						currentAnnotation.slideUp();
						media.showAnnotation(null, currentRelation, mediaelement, true);
						//media.hideAnnotation(null, null, mediaelement, true);
					}
				});
				var annotationPane = $('<div class="media_annotations pane"></div>').appendTo(element);
				var table = $('<table></table>').appendTo(annotationPane);
				for (i in annotations) {
					annotation = annotations[i];
					row = $('<tr><td>'+annotation.startString+'</td><td><p>'+annotation.body.getDisplayTitle()+'</p></td></tr>').appendTo(table);
					row.data('relation', annotation);
					row.click(function( event ) {

						// only clicks on the background should cue up the annotation
						if ( $( event.target ).is( 'td,h4,div,p,tr' ) ) {
							var relation = $(this).data('relation');
							mediaelement.seek(relation);
							if (( relation.target.current.mediaSource.contentType != 'document' ) && ( relation.target.current.mediaSource.contentType != 'image' )) {
	              				setTimeout(function() {
	                				if(!mediaelement.is_playing()) {
	      								mediaelement.play();
	                				}
	              				},250);
							}
						}

					});
				}
				if (!foundAuxContent) {
					element.find('.media_annotations').show();
					annotationTab.addClass('select');
					foundAuxContent = true;
				}
			}

			var metadataTab = $('<div class="media_tab">Details</div>').appendTo(mediaTabs);
			var metadataPane = $('<div class="media_metadata pane"></div>').appendTo(element);
			metadataTab.click(function() {
				$(this).parent().parent().find('.pane').hide();
				media.minimizeAnnotationPane();
				metadataPane.show();
				$(this).parent().find('.media_tab').removeClass('select');
				metadataTab.addClass('select');
				if (currentRelation != null) {
					media.showAnnotation(null, currentRelation, mediaelement, true);
				}
			});
			var table = $( '<table></table>' ).appendTo( metadataPane );
			// basic Scalar properties
			table.append('<tr><td>Scalar URL</td><td><a href="'+node.url+'">'+node.url+'</a> (version '+node.current.number+')</td></tr>');
			table.append('<tr><td>Source URL</td><td><a href="'+node.current.sourceFile+'">'+node.current.sourceFile+'</a> ('+node.current.mediaSource.contentType+'/'+node.current.mediaSource.name+')</td></tr>');
			table.append('<tr><td>dcterms:title</td><td>'+node.getDisplayTitle()+'</td></tr>');
			if (null!=node.current.description) table.append('<tr><td>dcterms:description</td><td>'+node.current.description+'</td></tr>');
			if (null!=node.current.source) table.append('<tr><td>dcterms:source</td><td>'+node.current.source+'</td></tr>');
			if (null!=node.current.sourceLocation) table.append('<tr><td>dcterms:sourceLocation</td><td><a href="'+node.current.sourceLocation+'">'+node.current.sourceLocation+'</a></td></tr>');
			// auxiliary properties
			for ( prop in node.current.auxProperties ) {
				for ( i in node.current.auxProperties[ prop ] ) {
					value = node.current.auxProperties[ prop ][ i ];
					table.append( '<tr><td>' + prop + '</td><td>' + value + '</td></tr>');
				}
			}
			// API links
			table.append('<tr><td>View as</td><td><a href="'+node.url+'.rdfxml">RDF-XML</a>, <a href="'+node.url+'.rdfjson">RDF-JSON</a>, or <a href="'+node.url+'.meta">HTML</a></td></tr>');
			if (!foundAuxContent) {
				element.find('.media_metadata').show();
				metadataTab.addClass('select');
				foundAuxContent = true;
			}

			var detailsTab = $( '<div class="media_tab">Citations</div>' ).appendTo( mediaTabs );
			detailsTab.click( function() {
				media.options[ 'details' ].show( node );
			} );

			var sourceTab = $( '<div class="media_tab">Source</div>' ).appendTo( mediaTabs );
			sourceTab.click( function() {
				window.open( node.current.sourceFile, 'popout' );
			} );

			if (media.options.shy) {
				mediaelement.model.element.mouseenter(function() {
					var timeout = $(this).data('timeout');
					if (timeout != null) {
						clearTimeout(timeout);
					}
					mediaTabs.slideDown();
				})
				mediaelement.model.element.mouseleave(function() {
					if ( window.innerWidth > 480 ) {
						var timeout = $(this).data('timeout');
						if (timeout != null) {
							clearTimeout(timeout);
						}
						var timeout = setTimeout(function() { mediaTabs.slideUp(); }, 1000)
						$(this).data('timeout', timeout);
					}
				})
			} else {
				mediaTabs.show();
			}

			mediaelement.view.footer.find('.media_info').mouseenter(function(e) {
				var position = $(e.currentTarget).parent().parent().parent().offset();
				metadata.css({
					'right': (parseInt($(window).width()) - position.left + 10)+'px',
					'top': position.top+'px'
				});
				metadata.fadeIn();
			})

			$('body').bind('show_annotation', media.showAnnotation);

			$('body').bind('hide_annotation', media.hideAnnotation);

			element.addClass('caption_font');
			element.addClass('mediainfo');
		  	$('.media_metadata').addClass('caption_font');
		}

	}

})(jQuery);