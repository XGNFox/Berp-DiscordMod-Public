import path from 'path'
import { Player, PluginApi } from './@interface/pluginApi.i'
const { MessageEmbed } = require('discord.js');
const { Client, Collection, Intents } = require('discord.js');
const { Authflow } = require('prismarine-auth')
import axios from 'axios'
import { isPartiallyEmittedExpression } from 'typescript';
const fs = require('fs')
const { TOKEN, REALMCHATID, BANNED, LOGID, MOD, DISCORD, REALMID, EMAIL, GAMERSCORE_MINIMUM, WHITELIST_PSN_XBOX, ANTISPAM, XBOXMESSAGE } = require('../config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.login(TOKEN)
process.on('uncaughtException',(e)=>{
  console.log("BeRP attempted to crash but error was caught.")
  console.log(e)
})

class DiscordmodPlugin {
    private api: PluginApi

    constructor(api: PluginApi) {
      this.api = api
    }
   public cooldown = new Set<string>();
    public onLoaded(): void {
      this.api.getLogger().info('Plugin loaded!')
    this.api.autoConnect(EMAIL,REALMID)
        this.api.autoReconnect(EMAIL,REALMID)
    }
    public onEnabled(): void {
      this.api.getLogger().info('Plugin enabled!')
      this.api.getEventManager().on('PlayerJoin', async (userJoin) => {
        if(!DISCORD) return;
        new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
          const MicrosoftGT = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userJoin.getXuid()})/profile/settings?settings=Gamertag`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value

          const PFP = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userJoin.getXuid()})/profile/settings?settings=GameDisplayPicRaw`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value
        this.api.getLogger().info(`${userJoin.getName()} Has Joined ${this.api.getConnection().realm.name}`)
        const JoinMSG = new MessageEmbed()
        .setAuthor(MicrosoftGT,PFP)
        .setColor(`#36ff20`)
        .setDescription(`${userJoin.getName()} has joined ${this.api.getConnection().realm.name} <t:${Math.trunc(Date.now() / 1000)}:R>`)
        client.channels.fetch(REALMCHATID).then(async channel => await channel.send({embeds: [JoinMSG]})).catch();
      })
    })
      this.api.getEventManager().on(`PlayerInitialized`,(p)=>{
        this.automod(p)
      })
      this.api.getEventManager().on(`PlayerLeft`,async (userLeft)=>{
        if(!DISCORD) return;
        new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
          const MicrosoftGT = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userLeft.getXuid()})/profile/settings?settings=Gamertag`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value

          new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
          const PFP = (await axios.get(`https://profile.xboxlive.com/users/xuid(${userLeft.getXuid()})/profile/settings?settings=GameDisplayPicRaw`, {
            headers:{
              'x-xbl-contract-version': '2',
              'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
              "Accept-Language": "en-US"
            }
          })).data.profileUsers[0].settings[0].value
        this.api.getLogger().info(`${userLeft.getName()} Has Left ${this.api.getConnection().realm.name}`)
        const LeftMSG = new MessageEmbed()
        .setAuthor(MicrosoftGT,PFP)
        .setColor(`#ff0000`)
        .setDescription(`${userLeft.getName()} has left ${this.api.getConnection().realm.name} <t:${Math.trunc(Date.now() / 1000)}:R>`)
        client.channels.fetch(REALMCHATID).then(async channel => await channel.send({embeds: [LeftMSG]})).catch();
      })
    })
  })
        this.api.getEventManager().on('PlayerMessage', async (p)=> {
    if(!ANTISPAM) return;
    if(this.cooldown.has(`${p.sender.getName()}-${JSON.stringify(p.message)}-${this.cooldown.size}`)&& this.cooldown.size == 4) return this.kickplayer(p.sender,`Do not spam messages!`)
    this.cooldown.add(`${p.sender.getName()}-${JSON.stringify(p.message)}-${this.cooldown.size+1}`)
    
    setTimeout(()=>{
      this.cooldown.forEach(p=>{
        this.cooldown.delete(p)
      })
    },20000)
     

})
      this.api.getEventManager().on(`PlayerMessage`,async (userMessage)=>{
        if(!DISCORD) return;
        this.api.getLogger().info(`(REALM) ${userMessage.sender.getName()}: ${userMessage.message}`)
        client.channels.fetch(REALMCHATID).then(async channel => await channel.send(`**${userMessage.sender.getName()}**: ${userMessage.message.replace(`@`,``)}`)).catch();
      })
  client.on(`messageCreate`,(message)=>{
    if(!DISCORD) return;
    if(message.author.bot) return;
   if(message.channel.id == REALMCHATID){
    this.api.getLogger().info(`(Discord) ${message.author.username}: ${message.content}`)
    this.api.getCommandManager().executeCommand(`tellraw @a {\"rawtext\":[{\"text\":\"§l§f(§9Discord§f) §r§f[§d${message.author.username}§f]: ${message.content}\"}]}`)
   }
    })
    client.on('interactionCreate', async interaction => {
      this.api.getCommandManager().executeCommand('list', async (res) => {
        if (!interaction.isCommand()) return;

        const commandNameSub = `${interaction.options.getSubcommand()}`;
        const { commandName } = interaction;
      
        if (commandName === 'ping') {
          await interaction.reply('Pong!');
        }
        if (commandNameSub === 'kick') {
          if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply(`You don't have permission to run this!`)
          try {
            for (const [, c] of this.api.getConnection().getConnectionManager().getConnections()) {
              const pl = c.getPlugins().get(this.api.getConfig().name)
              const api = pl.api
            }
            const listPlayersOnline1 = res.output[1].paramaters[0];
            var gamertag = interaction.options.getString('gamertag')
            let reason = interaction.options.getString('reason')
              if (listPlayersOnline1.includes(gamertag)) {
                if (!reason) reason = 'No Reason.'
              this.api.getCommandManager().executeCommand(`Kick "${gamertag}" ${reason}`);
              } else {
                return interaction.reply({content:'That user isn\'t in the realm or can\'t be found!', ephemeral: true})
              }
              } catch (error) {
                return interaction.reply(`Error! Try again!`)
              }
              return interaction.reply({content: `Successfully kicked ${gamertag}!`, ephemeral: true })
              }
        if (commandNameSub === 'command') {
          if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply(`You don't have permission to run this!`)
          try {
          this.api.getCommandManager().executeCommand(`${interaction.options.getString('command')}`);
          } catch (error) {
            return interaction.reply(`Error! Try again!`)
          }
          return interaction.reply({content: `Successfully executed \`${interaction.options.getString('command')}\`!`, ephemeral: true })
        }
        if (commandNameSub === 'list') {
          try {
            const BOTGT =   this.api.getConnection().getXboxProfile().extraData.displayName
            const REALMNAME = this.api.getConnection().realm.name
            let response = `/10 Players Online**:`;
            let players = [];
            response += `\n*-* ${BOTGT} (Bot)`;
            for (const [, p] of this.api.getPlayerManager().getPlayerList()) {
                players.push(p.getName());
                response += `\n*-* ${p.getName()} (${p.getDevice()})`;
            }
            const fancyResponse = new MessageEmbed()
                .setColor("#5a0cc0")
                .setTitle(`${REALMNAME}`)
                .setDescription(`**${players.length + 1}${response}`)
            await interaction.reply({embeds:[fancyResponse]})
                .catch((error) => {
        this.api.getLogger().error(error);
            
            });
          }catch(err){console.log(err)}
        }
        else if(commandNameSub === `whitelist`){
          if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply(`You don't have permission to run this!`)
          new Authflow('', `.\\auth`, { relyingParty: 'http://xboxlive.com' }).getXboxToken().then(async (t: { userHash: any; XSTSToken: any; }) => {
            const  { data }  = await axios(`https://profile.xboxlive.com/users/gt(${interaction.options.getString(`gamertag`)})/profile/settings?settings=Gamertag`, {
              headers:{ 'x-xbl-contract-version': '2','Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,"Accept-Language": "en-US" }
            })
            const xuid = data.profileUsers[0].id
          interaction.reply({ content: `${interaction.options.getString('gamertag')} has been Whitelisted!`, ephemeral: true })
          fs.readFile('./plugins/Berp-DiscordMod-Public-main/whitelist.json', 'utf8', (err,data)=>{
            var obj = JSON.parse(data)
            if(obj.includes(xuid)) return
            obj.push(xuid)
            var json = JSON.stringify(obj)
            fs.writeFile('./plugins/Berp-DiscordMod-Public-main/whitelist.json', json,err =>{
              if(err) {
                console.log(err)
                return
              }
            })
          })
          })
        }
        else if(commandNameSub === 'unwhitelist') {
          if (!interaction.memberPermissions.has('ADMINISTRATOR')) return interaction.reply(`You don't have permission to run this!`)
            new Authflow('', `.\\auth`, { relyingParty: 'http://xboxlive.com' }).getXboxToken().then(async (t: { userHash: any; XSTSToken: any; }) => {
            const  { data }  = await axios(`https://profile.xboxlive.com/users/gt(${interaction.options.getString(`gamertag`)})/profile/settings?settings=Gamertag`, {
              headers:{ 'x-xbl-contract-version': '2','Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,"Accept-Language": "en-US" }
            })
            const xuid = data.profileUsers[0].id
          fs.readFile('./plugins/Berp-DiscordMod-Public-main/whitelist.json', 'utf8', (err,data)=>{
            if(err) return interaction.reply("Could not read whitelist list! An unexpected error occurred! Try again.")
            var obj = JSON.parse(data)
            if(!obj.includes(xuid)) return interaction.reply(`User isn't whitelisted yet!`)
            for(var i = 0; i < obj.length; i++) {
              if(obj[i].includes(xuid)) obj.splice(i, 1)
            }
            var json = JSON.stringify(obj)
            fs.writeFile('./plugins/Berp-DiscordMod-Public-main/whitelist.json', json,err =>{
              if(err) {
                console.log(err)
                return interaction.reply("Unexpected error when trying to remove from whitelist!")
              }
              else {
                interaction.reply(`Sucessfully removed user from whitelist`);
              }
            })
          })
        })
        }
      })
      
      })
        }
  public automod(p: Player): void {
    if(!MOD) return;
    new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
      const GamerScore =  (await axios.get(`https://profile.xboxlive.com/users/xuid(${p.getXuid()})/profile/settings?settings=Gamerscore`, {
        headers:{
          'x-xbl-contract-version': '2',
          'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
          "Accept-Language": "en-US"
        }
      })).data.profileUsers[0].settings[0].value
      console.log(GamerScore)
    fs.readFile(path.resolve('./plugins/Berp-DiscordMod-Public-main/whitelist.json'), 'utf8',  async (err,data)=>{
      if(!data || err) return console.log(err);
      if(data.includes(p.getXuid())) return 
if(p.getName().length > 16) return this.kickplayer(p,`Invald Gamertag`)
    if(BANNED.includes(p.getDevice())) return this.kickplayer(p,`AutoMod Violation`)
    new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then((t)=>{
      axios.get(`https://titlehub.xboxlive.com/users/xuid(${p.getXuid()})/titles/titlehistory/decoration/scid,image,detail`, {
        headers:{
          'x-xbl-contract-version': '2',
          'Authorization': `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
          "Accept-Language": "en-US"
        }
      }).then((res)=>{
        if(GamerScore < GAMERSCORE_MINIMUM && !WHITELIST_PSN_XBOX) return this.kickplayer(p,`Alt Account Detect, Low Gamerscore!`)
        if(GamerScore < GAMERSCORE_MINIMUM && WHITELIST_PSN_XBOX && p.getDevice() != 'PlayStation' && p.getDevice() != 'Xbox') return this.kickplayer(p,`Alt Account Detect, Low Gamerscore!`)
        if(!res.data.titles[0]) return this.kickplayer(p,`Account is appearing offline/private!`)
        if(BANNED.includes(res.data.titles[0].name.replace(new RegExp('Minecraft for ','g'),''))) return this.kickplayer(p,`Recently Played An illegal Device!`)
        if(BANNED.includes(res.data.titles[0].name.replace(new RegExp('Minecraft for ','g'),''))) return this.kickplayer(p,`Recently Played An illegal Device!`)
        if(BANNED.includes(res.data.titles[0].name.replace(new RegExp('Minecraft for ','g'),''))) return this.kickplayer(p,`Recently Played An illegal Device!`)
      if(!res.data.titles[0].name.includes(`Minecraft`)) return this.kickplayer(p,`You aren't playing Minecraft!`)
      })
    })
  })
})
  }
  public kickplayer(p: Player, r: string): void{
this.api.getCommandManager().executeCommand(`Kick "${p.getXuid()}" ${r}`)
this.Xmessage(p,`This is ${this.api.getConnection().realm.name} AutoMod You Have Been Kicked For ${r}`)
      if(!DISCORD) return;
const AUTOMODLOG = new MessageEmbed()
.setTimestamp()
.setColor(`#ff0000`)
.setDescription(`**Gamertag**: ${p.getName()}\n**XUID**: ${p.getXuid()}\n**Device**: ${p.getDevice()}\n**Reason**: ${r}`)
client.channels.fetch(LOGID).then(async channel => await channel.send({embeds: [AUTOMODLOG]})).catch();
  }
    public onDisabled(): void {
      this.api.getLogger().info('Plugin disabled!')
    }

    
    public Xmessage(p:Player,m:string): void{
      if(!XBOXMESSAGE) return;
      new Authflow('',`${this.api.path}\\auth`,{ relyingParty: 'http://xboxlive.com'}).getXboxToken().then(async (t)=>{
        const message = await axios(`https://xblmessaging.xboxlive.com/network/xbox/users/me/conversations/users/xuid(${p.getXuid()})`, {
                method: 'POST',
              data: {
                      parts: [
                          {
                              text: `${m}`,
                              contentType: 'text',
                              version: 0,
                          },
                      ],
                  },
                  headers: {
                      Authorization: `XBL3.0 x=${t.userHash};${t.XSTSToken}`,
                  },
                });
          });
    }
}
export = DiscordmodPlugin
