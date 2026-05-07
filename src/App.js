import React, { useState } from 'react';

/* =============================================================
   MEDIA FORGE — The Concert Hall Design System
   Audio & Video Extraction Tool
   ============================================================= */

// Inline SVG icons
const VolumeIcon = ({ size = 24, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
);

const VideoIcon = ({ size = 24, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
    <line x1="7" y1="2" x2="7" y2="22"></line>
    <line x1="17" y1="2" x2="17" y2="22"></line>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <line x1="2" y1="7" x2="7" y2="7"></line>
    <line x1="2" y1="17" x2="7" y2="17"></line>
    <line x1="17" y1="17" x2="22" y2="17"></line>
    <line x1="17" y1="7" x2="22" y2="7"></line>
  </svg>
);

const DownloadIcon = ({ size = 24, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const LoaderIcon = ({ size = 24, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
);

const AlertIcon = ({ size = 24, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CheckIcon = ({ size = 24, ...props }) => (
  <svg {...props} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [url, setUrl] = useState('');
  const [mediaType, setMediaType] = useState('audio'); // 'audio' or 'video'
  const [format, setFormat] = useState('mp3');
  const [quality, setQuality] = useState('high');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [mediaInfo, setMediaInfo] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Update format when media type changes
  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    if (type === 'audio') {
      setFormat('mp3');
    } else {
      setFormat('mp4');
    }
  };

  const audioFormats = ['mp3', 'wav', 'flac'];
  const videoFormats = ['mp4', 'webm', 'mkv'];
  const currentFormats = mediaType === 'audio' ? audioFormats : videoFormats;

  const handleExtract = async () => {
    if (!url.trim()) {
      setErrorMessage('Please enter a valid URL');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setErrorMessage('');
    setMediaInfo(null);

    try {
      const response = await fetch(`${API_BASE_URL}/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          format, 
          quality,
          media_type: mediaType 
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Extraction failed');

      if (data.success) {
        const labelBitrate = data.bitrate || data.resolution || '';
        setMediaInfo({
          title: data.title,
          duration: data.duration,
          bitrate: labelBitrate,
          size: data.size
        });
        setFileId(data.file_id);
        const params = new URLSearchParams();
        if (data.title) params.set('title', data.title);
        if (labelBitrate) params.set('bitrate', labelBitrate);
        const qs = params.toString();
        setDownloadUrl(`${API_BASE_URL}/download/${data.file_id}${qs ? `?${qs}` : ''}`);
        setStatus('success');
      } else {
        throw new Error('Extraction failed');
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
      setStatus('error');
    }
  };

  const handleDownload = () => {
    if (!fileId) return;
    window.open(downloadUrl, '_blank');
    setTimeout(async () => {
      await fetch(`${API_BASE_URL}/cleanup/${fileId}`, { method: 'DELETE' });
    }, 5000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Special+Elite&display=swap');
        
        :root {
          --ink: #0B0B0C;
          --ink-soft: #1A1A1C;
          --slate: #2A2A2D;
          --smoke: #4A4A4D;
          --fog: #8A8A8D;
          --haze: #C7C5C0;
          --paper: #EFECE5;
          --paper-soft: #F7F4ED;
          --bone: #FBF9F4;
          --brick: #6B2A1F;
          --brick-deep: #3C1410;
          --ember: #B33A1A;
          --gold: #C8A24B;
          --gold-soft: #E5C97A;
          --sepia: #6B5638;
          
          --font-marquee: 'Anton', 'Impact', sans-serif;
          --font-poster: 'Bebas Neue', 'Anton', sans-serif;
          --font-headline: 'Oswald', 'Helvetica Neue', sans-serif;
          --font-body: 'Cormorant Garamond', 'Georgia', serif;
          --font-mono: 'Special Elite', 'Courier New', monospace;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'var(--ink)',
        color: 'var(--bone)',
        padding: '0',
        fontFamily: 'var(--font-body)',
        fontSize: '17px',
        lineHeight: '1.55',
        WebkitFontSmoothing: 'antialiased',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Marquee Strip */}
        <div style={{
          background: 'var(--bone)',
          color: 'var(--ink)',
          padding: '8px 0',
          overflow: 'hidden',
          borderBottom: '3px solid var(--ink)'
        }}>
          <div style={{
            fontFamily: 'var(--font-marquee)',
            fontSize: '14px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            animation: 'scroll 20s linear infinite'
          }}>
            <style>{`
              @keyframes scroll {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
            `}</style>
            <span>
              MEDIA FORGE ★ AUDIO ★ VIDEO ★ MP3 ★ MP4 ★ WAV ★ FLAC ★ WEBM ★ 
              MEDIA FORGE ★ AUDIO ★ VIDEO ★ MP3 ★ MP4 ★ WAV ★ FLAC ★ WEBM ★ 
              MEDIA FORGE ★ AUDIO ★ VIDEO ★ MP3 ★ MP4 ★ WAV ★ FLAC ★ WEBM ★ 
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '64px 32px',
          flex: 1
        }}>
          {/* Header */}
          <header style={{
            textAlign: 'center',
            marginBottom: '64px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <VolumeIcon size={40} style={{ color: 'var(--gold)' }} />
              <VideoIcon size={40} style={{ color: 'var(--gold)' }} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-marquee)',
              fontSize: 'clamp(48px, 10vw, 96px)',
              lineHeight: '0.95',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              margin: '0 0 16px 0'
            }}>
              MEDIA FORGE
            </h1>
            <p style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '14px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--haze)'
            }}>
              Extract Audio & Video From Any URL
            </p>
            <div style={{
              width: '60px',
              height: '3px',
              background: 'var(--gold)',
              margin: '24px auto 0'
            }} />
          </header>

          {/* Main Panel */}
          <div style={{
            background: 'var(--paper)',
            color: 'var(--ink)',
            padding: '48px',
            boxShadow: '8px 8px 0 var(--ink)',
            border: '3px solid var(--ink)'
          }}>
            {/* Media Type Toggle */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-headline)',
                fontWeight: '500',
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--smoke)',
                marginBottom: '12px'
              }}>
                Media Type
              </label>
              <div style={{ display: 'flex', gap: '0' }}>
                <button
                  onClick={() => handleMediaTypeChange('audio')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    fontFamily: 'var(--font-marquee)',
                    fontSize: '18px',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    border: '3px solid var(--ink)',
                    borderRight: 'none',
                    background: mediaType === 'audio' ? 'var(--ink)' : 'transparent',
                    color: mediaType === 'audio' ? 'var(--gold)' : 'var(--ink)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 120ms ease'
                  }}
                >
                  <VolumeIcon size={24} />
                  Audio
                </button>
                <button
                  onClick={() => handleMediaTypeChange('video')}
                  style={{
                    flex: 1,
                    padding: '16px 24px',
                    fontFamily: 'var(--font-marquee)',
                    fontSize: '18px',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    border: '3px solid var(--ink)',
                    background: mediaType === 'video' ? 'var(--ink)' : 'transparent',
                    color: mediaType === 'video' ? 'var(--gold)' : 'var(--ink)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 120ms ease'
                  }}
                >
                  <VideoIcon size={24} />
                  Video
                </button>
              </div>
            </div>

            {/* URL Input */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontFamily: 'var(--font-headline)',
                fontWeight: '500',
                fontSize: '11px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--smoke)',
                marginBottom: '8px'
              }}>
                Source URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-body)',
                  fontSize: '18px',
                  background: 'var(--bone)',
                  border: '0',
                  borderBottom: '3px solid var(--ink)',
                  padding: '12px 8px',
                  color: 'var(--ink)',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = 'var(--gold)'}
                onBlur={(e) => e.target.style.borderBottomColor = 'var(--ink)'}
              />
            </div>

            {/* Format & Quality */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              marginBottom: '32px'
            }}>
              {/* Format */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: '500',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--smoke)',
                  marginBottom: '12px'
                }}>
                  Format
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {currentFormats.map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        fontFamily: 'var(--font-headline)',
                        fontWeight: '600',
                        fontSize: '13px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        border: '2px solid var(--ink)',
                        background: format === fmt ? 'var(--ink)' : 'transparent',
                        color: format === fmt ? 'var(--bone)' : 'var(--ink)',
                        cursor: 'pointer',
                        transition: 'all 120ms ease'
                      }}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: 'var(--font-headline)',
                  fontWeight: '500',
                  fontSize: '11px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--smoke)',
                  marginBottom: '12px'
                }}>
                  Quality
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(mediaType === 'video' ? ['1080p', '720p', '480p'] : ['high', 'medium', 'low']).map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      style={{
                        flex: 1,
                        padding: '12px 8px',
                        fontFamily: 'var(--font-headline)',
                        fontWeight: '600',
                        fontSize: '13px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        border: '2px solid var(--ink)',
                        background: quality === q ? 'var(--ink)' : 'transparent',
                        color: quality === q ? 'var(--bone)' : 'var(--ink)',
                        cursor: 'pointer',
                        transition: 'all 120ms ease'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{
              borderTop: '2px solid var(--ink)',
              margin: '32px 0'
            }} />

            {/* Extract Button */}
            <button
              onClick={handleExtract}
              disabled={status === 'processing'}
              style={{
                width: '100%',
                padding: '18px 24px',
                fontFamily: 'var(--font-headline)',
                fontWeight: '600',
                fontSize: '15px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: '3px solid var(--ink)',
                background: status === 'processing' ? 'var(--smoke)' : 'var(--ink)',
                color: 'var(--bone)',
                cursor: status === 'processing' ? 'not-allowed' : 'pointer',
                boxShadow: status === 'processing' ? 'none' : '6px 6px 0 var(--ink)',
                marginRight: '6px',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 120ms ease'
              }}
            >
              {status === 'processing' ? (
                <>
                  <LoaderIcon size={20} />
                  Processing...
                </>
              ) : (
                <>
                  {mediaType === 'audio' ? <VolumeIcon size={20} /> : <VideoIcon size={20} />}
                  Extract {mediaType === 'audio' ? 'Audio' : 'Video'}
                </>
              )}
            </button>

            {/* Error Message */}
            {status === 'error' && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: 'var(--brick)',
                color: 'var(--bone)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertIcon size={20} />
                <span style={{ fontFamily: 'var(--font-headline)', fontSize: '14px', letterSpacing: '0.04em' }}>
                  {errorMessage}
                </span>
              </div>
            )}

            {/* Success */}
            {status === 'success' && mediaInfo && (
              <div style={{ marginTop: '24px' }}>
                <div style={{
                  padding: '24px',
                  background: 'var(--bone)',
                  border: '2px solid var(--ink)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <CheckIcon size={24} style={{ color: 'var(--brick)' }} />
                    <span style={{
                      fontFamily: 'var(--font-marquee)',
                      fontSize: '20px',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em'
                    }}>
                      Ready for Download
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px'
                  }}>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: '10px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--smoke)',
                        marginBottom: '4px'
                      }}>Title</div>
                      <div style={{ color: 'var(--ink)' }}>{mediaInfo.title}</div>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: '10px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--smoke)',
                        marginBottom: '4px'
                      }}>Duration</div>
                      <div style={{ color: 'var(--ink)' }}>{mediaInfo.duration}</div>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: '10px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--smoke)',
                        marginBottom: '4px'
                      }}>{mediaType === 'video' ? 'Resolution' : 'Bitrate'}</div>
                      <div style={{ color: 'var(--ink)' }}>{mediaInfo.bitrate}</div>
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-headline)',
                        fontSize: '10px',
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'var(--smoke)',
                        marginBottom: '4px'
                      }}>File Size</div>
                      <div style={{ color: 'var(--ink)' }}>{mediaInfo.size}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '18px 24px',
                    fontFamily: 'var(--font-headline)',
                    fontWeight: '600',
                    fontSize: '15px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border: '3px solid var(--brick)',
                    background: 'var(--brick)',
                    color: 'var(--bone)',
                    cursor: 'pointer',
                    boxShadow: '6px 6px 0 var(--brick-deep)',
                    marginRight: '6px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 120ms ease'
                  }}
                >
                  <DownloadIcon size={20} />
                  Download {format.toUpperCase()}
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: '48px',
            textAlign: 'center'
          }}>
            <p style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fog)'
            }}>
              Supports YouTube • Vimeo • SoundCloud • 1000+ Sites
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--slate)',
              marginTop: '8px'
            }}>
              Powered by yt-dlp & FFmpeg
            </p>
          </footer>
        </div>

        {/* Bottom Marquee */}
        <div style={{
          background: 'var(--gold)',
          color: 'var(--ink)',
          padding: '6px 0',
          overflow: 'hidden',
          borderTop: '2px solid var(--ink)',
          marginTop: 'auto'
        }}>
          <div style={{
            fontFamily: 'var(--font-poster)',
            fontSize: '13px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            animation: 'scroll-reverse 25s linear infinite'
          }}>
            <style>{`
              @keyframes scroll-reverse {
                from { transform: translateX(-50%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <span>
              MP3 320KBPS ★ LOSSLESS WAV ★ FLAC ★ MP4 1080P ★ WEBM ★ MKV ★ 
              MP3 320KBPS ★ LOSSLESS WAV ★ FLAC ★ MP4 1080P ★ WEBM ★ MKV ★ 
              MP3 320KBPS ★ LOSSLESS WAV ★ FLAC ★ MP4 1080P ★ WEBM ★ MKV ★ 
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;