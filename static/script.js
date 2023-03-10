///////////////
///定数の定義
const ringSrcArray = ["/img/color_colorful.png", "/img/color_black.png"];
const partsSrcArray = ["/img/etc_cat.png", "/img/etc_bird.png"];
const OFFSET = 15;   ///クロップする円よりも内側にカットするためのオフセット (px)
const ring = document.getElementsByClassName('ring');
const parts = document.getElementsByClassName('parts');

///////////////
///関数
///canvasを初期化する関数
const initializeCanvas = (targetCanvasElement, targetCanvas) => {
	targetCanvas.clearRect(0, 0, targetCanvasElement.width, targetCanvasElement.height);   ///一度canvasをクリア　（背景→写真→マスクを順番に載せていく必要があるから）
	targetCanvas.fillStyle = 'rgb(0, 0, 0, 1)';
	targetCanvas.fillRect(0, 0, targetCanvasElement.width, targetCanvasElement.height);   ///背景の作成
};

///クロップする円形の枠を表示させる関数
const showCropFrame = (targetCanvasElement, targetCanvas) => {
  const  cropParams = {
    centerX: targetCanvasElement.width / 2,
    centerY: targetCanvasElement.height / 2,
    radius: targetCanvasElement.width / 2
  };
  targetCanvas.beginPath();
  targetCanvas.rect(0, 0, targetCanvasElement.width, targetCanvasElement.height);
  targetCanvas.arc(cropParams.centerX, cropParams.centerY, cropParams.radius, 0, 2 * Math.PI);
  targetCanvas.closePath();
  targetCanvas.fillStyle = 'rgb(91, 91, 91, 0.9)';
  targetCanvas.fill('evenodd');
};

const calculateDrawScale = (aspectRatio, img, targetCanvasElement) => {
	if (aspectRatio > 1) {
		return (img.width > targetCanvasElement.width) ? targetCanvasElement.width / img.width
		: (img.height > targetCanvasElement.height) ? targetCanvasElement.height / img.height
		: 1
	} else {
		return (img.height > targetCanvasElement.height) ? targetCanvasElement.height / img.height
		: (img.width > targetCanvasElement.width) ? targetCanvasElement.width / img.width
		: 1;
	}
};

///////////////
///canvasの初期値設定
const canvasElement = document.getElementById('canvas');
const canvas = canvasElement.getContext('2d');
canvas.fillStyle = 'rgb(0, 0, 0, 1)';
canvas.fillRect(0, 0, canvasElement.width, canvasElement.height);
canvas.fillStyle = 'rgb(255, 255, 255)';
canvas.font = '20px "yomogi"';
canvas.textAlign = 'center';
canvas.fillText('1. 画像をアップロードしてください', canvasElement.width / 2, canvasElement.height / 2);


///////////////
///画像ファイルがアップロードされたときの動作
const downloadButton = document.getElementById('download');
const uploader = document.getElementById('uploader');

uploader.onchange = () => {
	initializeCanvas(canvasElement, canvas);

	///////////////
	///アップロードされたファイルを読み込む
	const uploadedFile = uploader.files;
	const fileReader = new FileReader();
	fileReader.onload = () => {
		///////////////
		///画像が読み込まれたら
		const img = new Image();
		img.src = fileReader.result;
		img.onload = () => {
			///////////////
			///ラジオボタンとDLボタンの有効化
			const radioButton = document.getElementsByClassName('radio-button');
			for(let count = 0; count < radioButton.length; count++) radioButton[count].disabled = false;   //for分でラジオボタンのlength回disabledをfalseにする
			downloadButton.style.visibility = 'visible';

			///////////////
			///読み込んだ画像をcanvasで描画する
			const aspectRatio = img.width / img.height;  ///１より大きければアップロードした画像は横長
			let mouseWheelRatio = 1;
			let coordinateX = 0;
			let coordinateY = 0;
			let displacementX = 0;
			let displacementY = 0;
			const drawScale = calculateDrawScale(aspectRatio, img, canvasElement);
			canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale) / 2, (canvasElement.height - img.height * drawScale) / 2, img.width * drawScale, img.height * drawScale);   ///drawScaleをかけた画像をcanvasに描画
			showCropFrame(canvasElement, canvas);

			const addImageToCanvas = (parentCanvas, imgSrc) => {
				const iconImage = new Image();
				iconImage.src = imgSrc;
				parentCanvas.drawImage(iconImage, 0, 0, iconImage.width, iconImage.height, 0, 0, iconImage.width, iconImage.height);
			}

			for (let count = 0; count < ring.length; count++) {
				ring[count].onclick = () => {
					initializeCanvas(canvasElement, canvas);
					canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
					showCropFrame(canvasElement, canvas);
					addImageToCanvas(canvas, ringSrcArray[count]);
					Object.keys(parts).forEach((key) => {
						if (parts[key].checked) {
							addImageToCanvas(canvas, partsSrcArray[key]);
						}
					});

					let mouseDown = false;
					canvasElement.onmousedown = (event) => {
						mouseDown = true;
						coordinateX = event.offsetX - displacementX;
						coordinateY = event.offsetY - displacementY;
						return false;
					}
					canvasElement.onmousemove = (event) => {
						if (!mouseDown) return;
						initializeCanvas(canvasElement, canvas);
						displacementX = event.offsetX - coordinateX;
						displacementY = event.offsetY - coordinateY;
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						if (ring[count].checked) addImageToCanvas(canvas, ringSrcArray[count]);
						Object.keys(parts).forEach((key) => {
							if (parts[key].checked) {
								addImageToCanvas(canvas, partsSrcArray[key]);
							}
						});
						return false;
					}
					canvasElement.onmouseup = canvasElement.onmouseout = (event) => {
						if (!mouseDown) return;
						initializeCanvas(canvasElement, canvas);
						mouseDown = false;
						const displacementObj = {
							valueX: event.offsetX - coordinateX,
							valueY: event.offsetY - coordinateY
						};
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						if (ring[count].checked) addImageToCanvas(canvas, ringSrcArray[count]);
						showCropFrame(canvasElement, canvas);
						Object.keys(parts).forEach((key) => {
							if (parts[key].checked) {
								addImageToCanvas(canvas, partsSrcArray[key]);
							}
						});
						displacementX = displacementObj.valueX;
						displacementY = displacementObj.valueY;
						return false;
					}
					canvasElement.onmousewheel = (event) => {
						let ratio = event.wheelDelta / 6;
						if (ratio > 100) ratio = 100;
						if (ratio < -100) ratio = -100;
						mouseWheelRatio = Math.round(mouseWheelRatio * 100 + Math.floor(ratio)) / 100;
						if(mouseWheelRatio > 3) mouseWheelRatio = 3;
						if(mouseWheelRatio < 0.1) mouseWheelRatio = 0.1;
						initializeCanvas(canvasElement, canvas);
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						if (ring[count].checked) addImageToCanvas(canvas, ringSrcArray[count]);
						Object.keys(parts).forEach((key) => {
							if (parts[key].checked) {
								addImageToCanvas(canvas, partsSrcArray[key]);
							}
						});
						return false;
					}
				};
			}
			for (let count = 0; count < parts.length; count++) {
				parts[count].onclick = () => {
					initializeCanvas(canvasElement, canvas);
					canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
					showCropFrame(canvasElement, canvas);
					Object.keys(ring).forEach((key) => {
						if (ring[key].checked) {
							addImageToCanvas(canvas, ringSrcArray[key]);
						}
					});
					addImageToCanvas(canvas, partsSrcArray[count]);

					let mouseDown = false;
					canvasElement.onmousedown = (event) => {
						mouseDown = true;
						coordinateX = event.offsetX - displacementX;
						coordinateY = event.offsetY - displacementY;
						return false;
					}
					canvasElement.onmousemove = (event) => {
						if (!mouseDown) return;
						initializeCanvas(canvasElement, canvas);
						displacementX = event.offsetX - coordinateX;
						displacementY = event.offsetY - coordinateY;
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						Object.keys(ring).forEach((key) => {
							if (ring[key].checked) {
								addImageToCanvas(canvas, ringSrcArray[key]);
							}
						});
						if (parts[count].checked) addImageToCanvas(canvas, partsSrcArray[count]);
						return false;
					}
					canvasElement.onmouseup = canvasElement.onmouseout = (event) => {
						if (!mouseDown) return;
						initializeCanvas(canvasElement, canvas);
						mouseDown = false;
						const displacementObj = {
							valueX: event.offsetX - coordinateX,
							valueY: event.offsetY - coordinateY
						};
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
						showCropFrame(canvasElement, canvas);
						Object.keys(ring).forEach((key) => {
							if (ring[key].checked) {
								addImageToCanvas(canvas, ringSrcArray[count]);
							}
						});
						if (parts[count].checked) addImageToCanvas(canvas, partsSrcArray[count]);
						displacementX = displacementObj.valueX;
						displacementY = displacementObj.valueY;
						return false;
					}
					canvasElement.onmousewheel = (event) => {
						let ratio = event.wheelDelta / 6;
						if (ratio > 100) ratio = 100;
						if (ratio < -100) ratio = -100;
						mouseWheelRatio = Math.round(mouseWheelRatio * 100 + Math.floor(ratio)) / 100;
						if(mouseWheelRatio > 3) mouseWheelRatio = 3;
						if(mouseWheelRatio < 0.1) mouseWheelRatio = 0.1;
						initializeCanvas(canvasElement, canvas);
						canvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画	
						showCropFrame(canvasElement, canvas);
						Object.keys(ring).forEach((key) => {
							if (ring[key].checked) {
								addImageToCanvas(canvas, ringSrcArray[key]);
							}
						});
						if (parts[count].checked) addImageToCanvas(canvas, partsSrcArray[count]);
						return false;
					}
				};
			}

			///////////////
			///downloadボタンが押されたら
			downloadButton.onclick = () => {
				const cropImageElement = document.createElement('canvas');
    		const cropImageCanvas = cropImageElement.getContext('2d');
    		cropImageElement.width = canvasElement.width;
    		cropImageElement.height = canvasElement.height;
				cropImageCanvas.drawImage(img, 0, 0, img.width, img.height, (canvasElement.width - img.width * drawScale * mouseWheelRatio) / 2 + displacementX, (canvasElement.height - img.height * drawScale * mouseWheelRatio) / 2 + displacementY, img.width * drawScale * mouseWheelRatio, img.height * drawScale * mouseWheelRatio);   ///drawScaleをかけた画像をcanvasに描画
    		cropImageCanvas.globalCompositeOperation = 'destination-in';
    		cropImageCanvas.beginPath();
    		cropImageCanvas.arc(cropImageElement.width / 2, cropImageElement.height / 2, cropImageElement.width / 2 - OFFSET, 0, 2 * Math.PI);
    		cropImageCanvas.fillStyle = 'rgb(10, 10, 10, 1)';
    		cropImageCanvas.fill();
    		cropImageCanvas.closePath();
				cropImageCanvas.beginPath();
    		cropImageCanvas.globalCompositeOperation = 'source-over';
				for (let count = 0; count < ring.length; count++) {
					if (ring[count].checked) {
						addImageToCanvas(cropImageCanvas, ringSrcArray[count]);
					}
				}
				for (let count = 0; count < parts.length; count++) {
					if (parts[count].checked) {
						addImageToCanvas(cropImageCanvas, partsSrcArray[count]);
					}
				}
    		const link = document.createElement('a');
    		link.href = cropImageElement.toDataURL('image/png');
    		link.download = 'imoniCamp_icon.png';
    		link.click();
			};
		};
	};
	fileReader.readAsDataURL(uploadedFile[0]);
};