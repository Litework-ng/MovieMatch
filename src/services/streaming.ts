import axios from 'axios';

const BASE_URL = 'https://streaming-availability.p.rapidapi.com';
const API_KEY = process.env.REACT_APP_STREAM_AVAILABILITY_KEY;

export const getStreamingAvailability = async (title: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/shows/search/title`, {
      params: {
        title,
        country: 'us',
        show_type: 'movie',
        output_language: 'en'
      },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com',
      },
    });

    const item = res.data?.[0]; // first match
    const streamOptions = item?.streamingOptions?.us || [];

    const platforms = streamOptions
      .filter((option: any) => option.type === 'subscription') // only show streamers
      .map((option: any) => ({
        service: option.service.name,
        logo: option.service.imageSet?.lightThemeImage || '/fallback-logo.png',
        link: option.link
      }));
console.log(streamOptions)
    return platforms;
  } catch (err) {
    console.error('Error fetching streaming availability:', err);
    return [];
  }
};
