/*
 _._     _,-'""`-._
(,-.`._,'(       |\`-/|
    `-.-' \ )-`( , o o)
          `-    \`_`"'-
*/

const fetch = require('node-fetch');

class WordGenerator {

	availableCharactersGroup = {}
	pattern = {}
	patternBases = []

	constructor(availableCharactersGroup, pattern) {
		this.availableCharactersGroup = availableCharactersGroup
		this.pattern = pattern
		for (let i = 0; i < pattern.length; i++) {
			const characterGroupIndex = pattern.charAt(i)
			const characters = availableCharactersGroup[characterGroupIndex]
			this.patternBases.push(characters.length)	
		}

	}

	generateArrayValue(value) {
		let temp = value;
		const arrayValue = [];
		for (let i = this.patternBases.length - 1; i >= 0; i--) {
			const base = this.patternBases[i];
			arrayValue.unshift(temp % base)
			temp = parseInt(temp/base)
		}
		return arrayValue
	}

	generateWordByArrayValue(arrayValue) {
		let word = ''
		for (let i = 0; i < arrayValue.length; i++) {
			const characterGroupIndex = this.pattern.charAt(i)
			const characters = this.availableCharactersGroup[characterGroupIndex]
			const value = arrayValue[i];
			word += characters[value]
		}
		return word
	}

	generateWord(value) {
		const arrayValue = this.generateArrayValue(value)
		return this.generateWordByArrayValue(arrayValue)
	}

	getLength() {
		if(this.patternBases.length == 0) return 0
		let length = 1
		this.patternBases.forEach(base => {
			length*=base
		});
		return length
	}
}


class Bot {
	manager = null
	name = 'DEFAULT'
	constructor(manager, name) {
		this.manager = manager
		this.name = name
	}


	async start() {
		while('RUNNING' === this.manager.status) {
			const wordIndex = this.manager.wordIndex++
			const word = this.manager.wordGenerator.generateWord(wordIndex)
			console.log(this.name, `${wordIndex} - ${word}`)
			let result = await this.testWord(word);
			if(!result.includes('Incorrect word.')) {
				console.log(`${this.name} has found the answer:`)
				console.log(result)	
				this.manager.status = 'FINISHED'
			}

		}
	}

	async testWord(word) {
		const baseUrl = 'http://noauto.develrox.com/'
		let response = await fetch(`${baseUrl}?word=${word}`, {
			method: 'get',
			headers: {
				'Host': 'noauto.develrox.com',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Accept-Language': 'es-CL,es;q=0.8,en-US;q=0.5,en;q=0.3',
				'Accept-Encoding': 'gzip, deflate',
				'Referer': 'http://noauto.develrox.com/',
				'Connection': 'keep-alive',
				'Cookie': 'PHPSESSID=3ccdd21651e3657c57458682e85db649',
				'Upgrade-Insecure-Requests': '1',
				'Pragma': 'no-cache',
				'Cache-Control': 'no-cache'
			}
		});
		return await response.text();
	}
	
}

class Manager {

	threads = 0
	status = 'NEW'
	bots = []
	wordGenerator = null
	wordIndex = 0
	length = 0

	constructor(threads) {
		this.threads = threads;
		this.status = 'RUNNING'
		this.wordGenerator = new WordGenerator({
			'l': ['a', 'b', 'c', 'd'],
			'n': [0, 1, 2, 3]
		}, 'llllnnn')
		this.length = this.wordGenerator.getLength()

		for (let index = 0; index < this.threads; index++) {
			const bot = new Bot(this, `Bot #${index}`)
			this.bots.push(bot)
		}
	}

	start() {
		this.bots.forEach(bot => {
			bot.start()
		});
	}
}


const manager = new Manager(20)
manager.start()