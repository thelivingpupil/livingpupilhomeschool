const Video = () => {
  return (
    <section className="text-gray-600 body-font">
      <div className="h-screen flex items-center justify-center overflow-hidden relative">
        <iframe
          id="ytplayer"
          className="absolute z-10 w-auto min-w-full min-h-full max-w-none"
          type="text/html"
          src="https://www.youtube.com/embed/oTVf-rPYBKM?autoplay=1&controls=0&fs=0&loop=1"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
};

export default Video;
