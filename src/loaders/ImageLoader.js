/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Cache } from './Cache';
import { DefaultLoadingManager } from './LoadingManager';


function ImageLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

function detect () {

	return new Promise( ( resolve, reject ) => {

		if( !( 'createImageBitmap' in window ) ) {
			console.log( 'nay (no API)' );
			resolve( false );
		}

		var canvas = document.createElement( 'canvas' );
		canvas.width = 1;
		canvas.height = 2;
		var ctx = canvas.getContext( '2d' );

		var data = ctx.getImageData( 0, 0, 1, 2 );
		data.data[ 1 ] = 255;
		data.data[ 3 ] = 255;
		data.data[ 4 ] = 255;
		data.data[ 6 ] = 255;
		data.data[ 7 ] = 255;
		ctx.putImageData( data, 0, 0 );

		createImageBitmap( canvas, 0, 0, 1, 2, { imageOrientation: 'flipY'} ).then( res => {

			var canvasTest = document.createElement( 'canvas' );
			canvasTest.width = 1;
			canvasTest.height = 2;
			var ctxTest = canvasTest.getContext( '2d' );
			ctxTest.drawImage( res, 0, 0 )
			var dataTest = ctxTest.getImageData( 0, 0, 1, 2 );
			if( dataTest.data[ 0 ] === 255 && dataTest.data[ 1 ] === 0 && dataTest.data[ 2 ] === 255 ) resolve( true );
			else resolve( false ) ;
			document.body.appendChild( canvasTest );

			document.body.appendChild( canvas );

			resolve( false );

		})

	})

}

let canUseImageBitmap = false;
detect().then( res => { canUseImageBitmap = res; console.log( 'CI', res ) } );

Object.assign( ImageLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		if( canUseImageBitmap ) this.loadImageBitmap( url, onLoad, onProgress, onError );
		else this.loadImage( url, onLoad, onProgress, onError );

	},

	loadImage: function ( url, onLoad, onProgress, onError ) {

		console.log( 'LOADING IMAGE', url );

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

		var image = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'img' );

		image.addEventListener( 'load', function () {

			Cache.add( url, this );

			if ( onLoad ) onLoad( this );

			scope.manager.itemEnd( url );

		}, false );

		/*
		image.addEventListener( 'progress', function ( event ) {
			if ( onProgress ) onProgress( event );
		}, false );
		*/

		image.addEventListener( 'error', function ( event ) {

			if ( onError ) onError( event );

			scope.manager.itemEnd( url );
			scope.manager.itemError( url );

		}, false );

		if ( url.substr( 0, 5 ) !== 'data:' ) {

			if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

		}

		scope.manager.itemStart( url );

		image.src = url;

		return image;

	},

	loadImageBitmap: function ( url, onLoad, onProgress, onError ) {

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
		.then( res => createImageBitmap( res, { imageOrientation: 'flipY' } ) )
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


export { ImageLoader };
