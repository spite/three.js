/**
 * @author thespite / http://clicktorelease.com/
 */

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

let canUseImageBitmap = detectCreateImageBitmap();

export { canUseImageBitmap }
