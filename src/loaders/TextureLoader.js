/**
 * @author mrdoob / http://mrdoob.com/
 */

import { RGBAFormat, RGBFormat } from '../constants';
import { ImageLoader } from './ImageLoader';
import { ImageBitmapLoader } from './ImageBitmapLoader';
import { Texture } from '../textures/Texture';
import { DefaultLoadingManager } from './LoadingManager';

function detectCreateImageBitmap () {

	var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

	return new Promise( ( resolve, reject ) => {

		if( !( 'createImageBitmap' in window ) ) {
			reject();
			return;
		}

		fetch( url )
			.then( res => res.blob() )
			.then( blob => {
				console.log( 'blob is', blob);
				Promise.all( [
					createImageBitmap( blob, {imageOrientation: "none", premultiplyAlpha: "none"}),
					createImageBitmap( blob, {imageOrientation: "flipY", premultiplyAlpha: "none"}),
					createImageBitmap( blob, {imageOrientation: "none", premultiplyAlpha: "premultiply"}),
					createImageBitmap( blob, {imageOrientation: "flipY", premultiplyAlpha: "premultiply"})
				]).then( res => {
					console.log( res );
					resolve();
				}).catch( e => {
					console.log( e );
					reject();
				})

			});

	});

}

let canUseImageBitmap = detectCreateImageBitmap()

function TextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( TextureLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var texture = new Texture();

		canUseImageBitmap
		.then( () => {

			console.log( 'USING IMAGE BITMAP' );

			var loader = new ImageBitmapLoader( this.manager );
			loader.setCrossOrigin( this.crossOrigin );
			loader.setPath( this.path );

			loader.load( url, function ( img ) {

				texture.image = img;

				// JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
				var isJPEG = url.search( /\.(jpg|jpeg)$/ ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

				texture.format = isJPEG ? RGBFormat : RGBAFormat;
				texture.needsUpdate = true;

				if ( onLoad !== undefined ) {

					onLoad( texture );

				}

			}, onProgress, onError );

		} )
		.catch( () => {

			console.log( 'USING IMAGE' );

			var loader = new ImageLoader( this.manager );
			loader.setCrossOrigin( this.crossOrigin );
			loader.setPath( this.path );

			loader.load( url, function ( img ) {

				texture.image = img;

				// JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
				var isJPEG = url.search( /\.(jpg|jpeg)$/ ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

				texture.format = isJPEG ? RGBFormat : RGBAFormat;
				texture.needsUpdate = true;

				if ( onLoad !== undefined ) {

					onLoad( texture );

				}

			}, onProgress, onError );

		});

		return texture;

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


export { TextureLoader };
