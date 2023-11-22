export const markdownToSections = (text) => {
	const lines = text.split('\n')
	const sections = [];

	let headers = []
	let inCode = false

	let section = ''

	for (let line of lines) {
		if (line.startsWith('#') && !inCode) {
			if (section.trim().length) sections.push(section);
			// Parse header
			const depth = line.indexOf(' ')

			while (headers.length >= depth) { headers.pop() }

			headers.push(line.substring(line.indexOf(' ') + 1))
			section = headers.join(' > ')
			continue
		}

		if (line.trim() === '```') {
			inCode = !inCode;
		}

		section = `${section}\n${line}`;
	}

	sections.push(section);

	return sections;
}
