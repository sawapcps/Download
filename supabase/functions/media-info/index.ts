import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function detectPlatform(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) return 'facebook';
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('tiktok.com')) return 'tiktok';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
  if (urlLower.includes('vimeo.com')) return 'vimeo';
  if (urlLower.includes('dailymotion.com') || urlLower.includes('dai.ly')) return 'dailymotion';
  if (urlLower.includes('pinterest.com') || urlLower.includes('pin.it')) return 'pinterest';
  if (urlLower.includes('reddit.com')) return 'reddit';
  if (urlLower.includes('threads.net')) return 'threads';
  if (urlLower.includes('twitch.tv')) return 'twitch';
  return 'unknown';
}

function extractVideoId(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url);
    switch (platform) {
      case 'youtube':
        if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
        return urlObj.searchParams.get('v');
      case 'facebook': {
        const fbWatch = urlObj.searchParams.get('v');
        if (fbWatch) return fbWatch;
        const parts = urlObj.pathname.split('/');
        const videosIdx = parts.indexOf('videos');
        if (videosIdx !== -1) return parts[videosIdx + 1];
        const reelsIdx = parts.indexOf('reel');
        if (reelsIdx !== -1) return parts[reelsIdx + 1];
        return parts[parts.length - 1];
      }
      case 'instagram': {
        const parts = urlObj.pathname.split('/');
        if (parts[1] === 'p' || parts[1] === 'reel' || parts[1] === 'tv') return parts[2];
        return parts[parts.length - 1];
      }
      case 'tiktok': {
        const parts = urlObj.pathname.split('/');
        const videoIdx = parts.indexOf('video');
        if (videoIdx !== -1) return parts[videoIdx + 1];
        return parts[parts.length - 1];
      }
      case 'vimeo': {
        const parts = urlObj.pathname.split('/');
        return parts[1];
      }
      case 'dailymotion': {
        if (urlObj.hostname === 'dai.ly') return urlObj.pathname.slice(1);
        const parts = urlObj.pathname.split('/');
        return parts[2];
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

async function fetchMediaInfo(url: string, platform: string) {
  const videoId = extractVideoId(url, platform);
  let title = 'Video';
  let author = 'Unknown';
  let thumbnail = '';
  let duration = '0:00';

  try {
    switch (platform) {
      case 'youtube': {
        const response = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          title = data.title || 'YouTube Video';
          author = data.author_name || 'Unknown';
          thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
        break;
      }
      case 'vimeo': {
        const response = await fetch(
          `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
        );
        if (response.ok) {
          const data = await response.json();
          title = data.title || 'Vimeo Video';
          author = data.author_name || 'Unknown';
          thumbnail = data.thumbnail_url || '';
          if (data.duration) {
            duration = `${Math.floor(data.duration / 60)}:${(data.duration % 60).toString().padStart(2, '0')}`;
          }
        }
        break;
      }
      case 'tiktok': {
        const response = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
        );
        if (response.ok) {
          const data = await response.json();
          title = data.title || 'TikTok Video';
          author = data.author_name || data.author_unique_id || 'Unknown';
          thumbnail = data.thumbnail_url || '';
        }
        break;
      }
      case 'dailymotion': {
        const response = await fetch(
          `https://www.dailymotion.com/services/oembed?url=https://www.dailymotion.com/video/${videoId}`
        );
        if (response.ok) {
          const data = await response.json();
          title = data.title || 'Dailymotion Video';
          author = data.author_name || 'Unknown';
          thumbnail = data.thumbnail_url || '';
        }
        break;
      }
      default: {
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
        title = `${platformName} Video${videoId ? ` - ${videoId}` : ''}`;
      }
    }
  } catch (e) {
    console.error('Error fetching info:', e);
  }

  return { title, author, thumbnail, duration };
}

// Using yt-dlp for download (since you installed it)
async function getDownloadStream(url: string, quality: string, isAudio: boolean) {
  try {
    console.log('Trying yt-dlp for:', { url, quality, isAudio });
    
    let args = [
      "-j",
      "--no-warnings",
      "--no-playlist",
    ];

    if (isAudio) {
      args.push("--extract-audio");
      args.push("--audio-format", "mp3");
      args.push("--audio-quality", quality || "192");
    } else {
      const qualityMap: Record<string, string> = {
        '144': 'bestvideo[height<=144]+bestaudio/best[height<=144]',
        '240': 'bestvideo[height<=240]+bestaudio/best[height<=240]',
        '360': 'bestvideo[height<=360]+bestaudio/best[height<=360]',
        '480': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
        '720': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
        '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        '1440': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]',
        '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]',
      };
      const format = qualityMap[quality] || 'bestvideo+bestaudio';
      args.push("-f", format);
    }

    args.push(url);

    const cmd = new Deno.Command("yt-dlp", {
      args: args,
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout, stderr } = await cmd.output();
    const output = new TextDecoder().decode(stdout);
    const errorOutput = new TextDecoder().decode(stderr);

    if (errorOutput && !output) {
      console.error("yt-dlp error:", errorOutput);
      throw new Error(errorOutput);
    }

    const data = JSON.parse(output);

    let downloadUrl = data.url;
    if (data.formats && data.formats.length > 0) {
      const format = data.formats.find((f: any) => 
        isAudio ? f.ext === 'mp3' || f.ext === 'm4a' : f.ext === 'mp4'
      ) || data.formats[data.formats.length - 1];
      downloadUrl = format.url || data.url;
    }

    return {
      url: downloadUrl,
      filename: `${data.title || 'video'}.${isAudio ? 'mp3' : 'mp4'}`,
      contentType: isAudio ? 'audio/mpeg' : 'video/mp4',
    };
  } catch (error) {
    console.error("yt-dlp error:", error);
    return null;
  }
}

// Fallback: Use Cobalt API if yt-dlp fails
async function getDownloadStreamFallback(url: string, quality: string, isAudio: boolean) {
  try {
    console.log('Trying Cobalt API as fallback...');
    
    const body: any = {
      url: url,
      filenamePattern: 'basic',
      alwaysProxy: true,
    };

    if (isAudio) {
      body.aFormat = 'mp3';
      body.aQuality = quality || '192';
    } else {
      body.vCodec = 'h264';
      body.vQuality = quality || '720';
    }

    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.status === 'redirect' || data.status === 'stream') {
      return {
        url: data.url,
        filename: data.filename || `download.${isAudio ? 'mp3' : 'mp4'}`,
        contentType: isAudio ? 'audio/mpeg' : 'video/mp4',
      };
    } else {
      console.log('Cobalt failed:', data);
      return null;
    }
  } catch (e) {
    console.error('Cobalt error:', e);
    return null;
  }
}

function buildVideoFormats(url: string) {
  const qualities = [
    { label: '144p', res: '256x144', file: 'mp4' },
    { label: '240p', res: '426x240', file: 'mp4' },
    { label: '360p', res: '640x360', file: 'mp4' },
    { label: '480p', res: '854x480', file: 'mp4' },
    { label: '720p HD', res: '1280x720', file: 'mp4' },
    { label: '1080p Full HD', res: '1920x1080', file: 'mp4' },
    { label: '1440p (2K)', res: '2560x1440', file: 'mp4' },
    { label: '2160p (4K)', res: '3840x2160', file: 'mp4' },
  ];

  return qualities.map(q => ({
    quality: q.label,
    resolution: q.res,
    format: q.file.toUpperCase(),
    size: `~${Math.floor(Math.random() * 500 + 20)} MB`,
  }));
}

function buildAudioFormats() {
  const bitrates = ['64', '96', '128', '192', '256', '320'];
  return bitrates.map(b => ({
    quality: `${b} kbps`,
    bitrate: b,
    format: 'MP3',
    size: `~${Math.floor(Math.random() * 20 + 2)} MB`,
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const urlObj = new URL(req.url);
    const action = urlObj.searchParams.get('action') || 'info';
    const videoUrl = urlObj.searchParams.get('url') || '';
    const format = urlObj.searchParams.get('format') || 'video';
    const quality = urlObj.searchParams.get('quality') || '720';

    console.log('Request:', { action, videoUrl, format, quality });

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const platform = detectPlatform(videoUrl);

    if (action === 'download') {
      const isAudio = format === 'audio';
      let qualityValue = quality;

      if (!isAudio) {
        qualityValue = quality.replace('p', '').replace('HD', '').trim();
        if (qualityValue === '') qualityValue = '720';
      }

      // Try yt-dlp first
      let download = await getDownloadStream(videoUrl, qualityValue, isAudio);
      
      // If yt-dlp fails, try Cobalt as fallback
      if (!download || !download.url) {
        console.log('yt-dlp failed, trying Cobalt fallback...');
        download = await getDownloadStreamFallback(videoUrl, qualityValue, isAudio);
      }

      if (download && download.url) {
        return new Response(
          JSON.stringify({
            success: true,
            downloadUrl: download.url,
            filename: download.filename,
            contentType: download.contentType,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({
            error: 'Could not generate download',
            message: 'Both yt-dlp and Cobalt API failed. Try a different video or quality.',
            suggestion: 'Video may be protected or unavailable.'
          }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const info = await fetchMediaInfo(videoUrl, platform);

    return new Response(
      JSON.stringify({
        platform,
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
        author: info.author,
        videoFormats: buildVideoFormats(videoUrl),
        audioFormats: buildAudioFormats(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack || ''
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});