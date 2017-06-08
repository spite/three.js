/**
 * @author thespite / http://clicktorelease.com/
 */

import { Cache } from './Cache';
import { DefaultLoadingManager } from './LoadingManager';


function ImageBitmapLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( ImageBitmapLoader.prototype, {

	load: function ( url, options, onLoad, onProgress, onError ) {

		console.log( 'LOADING IMAGEBITMAP', url );

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		var scope = this;

		var cached = Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		fetch( url )
		.then( res => res.blob() )
		.then( res => createImageBitmap( res, { imageOrientation: options.flip?'flipY':'none' } ) )
		.then( res => {

			Cache.add( url, res );

			if ( onLoad ) onLoad( res );

			scope.manager.itemEnd( url );

		})
		.catch( e => {

			if ( onError ) onError( e );

			scope.manager.itemEnd( url );
			scope.manager.itemError( url );

		});

		var image = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'img' );

		/*
		image.addEventListener( 'progress', function ( event ) {

			if ( onProgress ) onProgress( event );

		}, false );
		*/

		if ( url.substr( 0, 5 ) !== 'data:' ) {

			//if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

		}

		scope.manager.itemStart( url );

		/*image.src = url;*/

		return image;
	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

} );


export { ImageBitmapLoader };
