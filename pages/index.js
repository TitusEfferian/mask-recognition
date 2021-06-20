import Head from 'next/head'
import '@tensorflow/tfjs';

import * as automl from '@tensorflow/tfjs-automl';
import { useEffect, useRef, useState } from 'react';

const frame = (video, model, canvas) => {
  model.detect(video).then(prediction => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    prediction.map(x => {
      if (x.label === 'unmasked') {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 4;
        ctx.strokeRect(x.box.left, x.box.top, x.box.width, x.box.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(x.label, x.box.left, x.box.top);
      }
      else {
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 4;
        ctx.strokeRect(x.box.left, x.box.top, x.box.width, x.box.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText(x.label, x.box.left, x.box.top);
      }
    })
    requestAnimationFrame(() => {
      frame(video, model, canvas)
    })
  })
}


export default function Home() {
  const videoRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    const initAutoML = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'user',
          }
        }).then(stream => {
          window.stream = stream;
          videoRef.current.srcObject = stream;
        })
      }
    }
    initAutoML();
  }, [])
  return (
    <div className="w-full max-w-2xl mx-auto relative flex items-center justify-center">
      <canvas ref={canvasRef} width="640" height="480" className="z-10">
      </canvas>
      <video
        onLoadedMetadata={async () => {
          const model = await automl.loadObjectDetection('model.json');
          frame(videoRef.current, model, canvasRef.current);
        }}
        autoPlay
        playsInline
        muted
        ref={videoRef}
        width="640"
        height="480"
        className="absolute z-0"
      />
    </div>
  )
}
