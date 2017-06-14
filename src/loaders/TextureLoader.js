/**
 * @author mrdoob / http://mrdoob.com/
 */

import { RGBAFormat, RGBFormat } from '../constants';
import { canUseImageBitmap } from './Detection';
import { ImageLoader } from './ImageLoader';
import { ImageBitmapLoader } from './ImageBitmapLoader';
import { Texture } from '../textures/Texture';
import { DefaultLoadingManager } from './LoadingManager';

function TextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( TextureLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var texture = new Texture();

		canUseImageBitmap
		.then( () => {

			console.log( 'USING IMAGE BITMAP' );
			texture.isImageBitmap = true;

			var loader = new ImageBitmapLoader( this.manager );
			loader.setCrossOrigin( this.crossOrigin );
			loader.setPath( this.path );

			loader.load( url, { flip: true }, function ( img ) {

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
			texture.isImageBitmap = false;

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
