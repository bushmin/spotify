const Telegraf = require('telegraf');
require('dotenv').config();
const ogs = require('open-graph-scraper');

let TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(TOKEN, {
    telegram: {               
        webhookReply: true  
    }
})

bot.hears(/open.spotify.com\/track(?=.*\?)/i, async ctx => {
    try{
        const options = { url: extractUrl(ctx.message.text) };
        const { error, result } = await ogs(options);
        if (error) {
            throw Error('invalid url')
        }

        await ctx.replyWithPhoto({ url: result.ogImage.url }, 
        {
            caption: escapeCharacters(`*${result.ogTitle}*
${extractName(result.ogDescription)} • ${result.musicReleaseDate.substring(0,4)}
[Spotify](${encodeURI(result.ogUrl)})`),
            parse_mode: 'MarkdownV2'
        });

        await ctx.replyWithAudio({url: result.ogAudio }, {
            title: `${result.ogTitle} (preview)`,
            performer: extractName(result.ogDescription)
        });

    } catch(err){
        console.log(err)
        return;
    }
    return;
} )

bot.hears(/open.spotify.com\/album/i, async ctx => {
    try{
        const options = { url: extractUrl(ctx.message.text) };
        const { error, result } = await ogs(options);
        if (error) {
            throw Error('invalid url')
        }

        await ctx.replyWithPhoto({ url: result.ogImage.url }, 
        {
            caption: escapeCharacters(`*${result.ogDescription}*
${result.musicReleaseDate.substring(0,4)}
[Spotify](${encodeURI(result.ogUrl)})`),
            parse_mode: 'MarkdownV2'
        });
    } catch(err){
        console.log(err)
        return;
    }
    return;
} )

function extractUrl(text){
    const match = text.match(/open.spotify.com(.+)(?= |\s)/);
    if (match === null) {
        return '';
    }
    return match[0]
}

function extractName(description){
    const match = description.match(/a song by (.*) on Spotify/);
    if (match === null) {
        return '';
    }
    return match[1]
}

function escapeCharacters(str){
    return str.replace(/(\[[^\][]*]\(http[^()]*\))|[_[\]()~>#+=|{}.!-]/gi,
    (x,y) => y ? y : '\\' + x);
}


bot.launch()