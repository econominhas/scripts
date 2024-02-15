/**
 * Script to analyze the data got from the research
 * made in 2024-02
 */

import { parse } from 'csv';
import { createReadStream } from 'fs';
import { join } from 'path';

interface ResearchData {
	gender:
		| 'Feminino'
		| 'Masculino'
		| 'Transgênero'
		| 'Não binário'
		| 'Prefiro não dizer';

	age:
		| 'Menos de 18 anos'
		| '18-24 anos de idade'
		| '25-34 anos de idade'
		| '35-44 anos de idade'
		| '45-54 anos de idade'
		| '55-64 anos de idade'
		| '65+ anos de idade';

	income:
		| 'Até R$ 830'
		| 'De R$ 831 a R$ 1.412'
		| 'De R$ 1.412 a R$ 2.490'
		| 'De R$ 2.491 a R$ 4.150'
		| 'De R$ 4.151 a R$ 6.225'
		| 'De R$ 6.226 a R$ 10.375'
		| 'Mais de R$ 10.376';

	rate: string;

	language:
		| 'Amigável: "Ei, bem-vindo! Estamos felizes em vê-lo por aqui!"'
		| 'Casual: "Oi, que bom te ver por aqui!"'
		| 'Descontraído: "Hey, que bom que você chegou!"'
		| 'Profissional: "Olá, seja bem-vindo ao nosso aplicativo de gestão financeira."'
		| 'Nenhuma das anteriores';

	organize:
		| 'Planejamento financeiro é importante e utilizo um sistema para controlar as entradas e saídas de dinheiro.'
		| 'Planejamento financeiro é importante e anoto e controlo apenas as saídas de dinheiro.'
		| 'Já tentei, mas acabo esquecendo de anotar e controlar minhas as despesas.'
		| 'Nunca tentei fazer qualquer tipo de anotação ou controle das minhas finanças.';
}

const getData = (): Promise<Array<ResearchData>> => {
	return new Promise((resolve, reject) => {
		const data: Array<ResearchData> = [];

		createReadStream(join(__dirname, 'files', 'research.csv'))
			.pipe(
				parse({
					delimiter: ',',
					skipEmptyLines: true,
				}),
			)
			.on('data', (row) => {
				data.push({
					gender: row[1],
					age: row[2],
					income: row[4],
					rate: row[7],
					language: row[3],
					organize: row[6],
				});
			})
			.on('end', () => {
				resolve(data);
			})
			.on('error', (err) => {
				reject(err);
			});
	});
};

const getGroups = (data: Array<ResearchData>) => {
	const loveGroup: Array<ResearchData> = [];
	const neutralGroup: Array<ResearchData> = [];
	const hateGroup: Array<ResearchData> = [];

	for (const row of data) {
		if (['4', '5'].includes(row.rate)) {
			loveGroup.push(row);
		}
		if (['3'].includes(row.rate)) {
			neutralGroup.push(row);
		}
		if (['1', '2'].includes(row.rate)) {
			hateGroup.push(row);
		}
	}

	return {
		loveGroup,
		neutralGroup,
		hateGroup,
	};
};

const getAnalyzes = (data: Array<ResearchData>) => {
	const gender: Record<string, number> = {};
	const age: Record<string, number> = {};
	const income: Record<string, number> = {};
	const language: Record<string, number> = {};
	const organize: Record<string, number> = {};

	for (const row of data) {
		if (!gender[row.gender]) {
			gender[row.gender] = 0;
		}
		if (!age[row.age]) {
			age[row.age] = 0;
		}
		if (!income[row.income]) {
			income[row.income] = 0;
		}
		if (!organize[row.organize]) {
			organize[row.organize] = 0;
		}
		if (!language[row.language]) {
			language[row.language] = 0;
		}

		gender[row.gender]++;
		age[row.age]++;
		income[row.income]++;
		organize[row.organize]++;
		language[row.language]++;
	}

	const genderSorted = Object.entries(gender)
		.filter(([_, val]) => (100 * val) / data.length >= 20)
		.sort((a, b) => {
			return b[1] - a[1];
		});
	const ageSorted = Object.entries(age)
		.filter(([_, val]) => (100 * val) / data.length >= 20)
		.sort((a, b) => {
			return b[1] - a[1];
		});
	const incomeSorted = Object.entries(income)
		.filter(([_, val]) => (100 * val) / data.length >= 15)
		.sort((a, b) => {
			return b[1] - a[1];
		});
	const languageSorted = Object.entries(language)
		.filter(([_, val]) => (100 * val) / data.length >= 15)
		.sort((a, b) => {
			return b[1] - a[1];
		});
	const organizeSorted = Object.entries(organize)
		.filter(([_, val]) => (100 * val) / data.length >= 15)
		.sort((a, b) => {
			return b[1] - a[1];
		});

	console.log(genderSorted);
	console.log(ageSorted);
	console.log(incomeSorted);
	console.log(languageSorted);
	console.log(organizeSorted);
};

const main = async () => {
	const data = await getData();

	const { loveGroup, neutralGroup } = getGroups(data);

	// getAnalyzes(loveGroup);
	// getAnalyzes(neutralGroup);
	getAnalyzes([...loveGroup, ...neutralGroup]);
};

main();
