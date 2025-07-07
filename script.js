document.addEventListener('DOMContentLoaded', () => {
    let allStandingsData = []; // Variável para armazenar todos os dados de classificação
    fetch('pontuacoes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                processData(data);
                setupFilterButtons();
            } else {
                displayErrorMessage("Nenhum dado de pontuação encontrado.");
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);
            displayErrorMessage("Erro ao carregar os dados de pontuação. Verifique o arquivo 'pontuacoes.json'.");
        });

    function processData(allRaceData) {
        const pilotData = {}; // Objeto para armazenar os dados completos de cada piloto
        const constructorPoints = {}; // Objeto para armazenar a pontuação total de cada construtor

        // Calcular pontuação total e armazenar o tipo de cada piloto
        allRaceData.forEach(race => {
            race.resultados.forEach(result => {
                if (pilotData[result.piloto]) {
                    pilotData[result.piloto].pontos += result.pontos;
                } else {
                    // Na primeira vez que o piloto aparece, armazena seus pontos e o tipo
                    pilotData[result.piloto] = {
                        pontos: result.pontos,
                        tipo: result.tipo // Captura 'Pessoa' ou 'IA'
                    };
                }

                if (result.equipe) {
                    if (constructorPoints[result.equipe]) {
                        constructorPoints[result.equipe] += result.pontos;
                    } else {
                        constructorPoints[result.equipe] = result.pontos;
                    }
                }
            });
        });

        // Converter para um array para facilitar a ordenação
        const standings = Object.keys(pilotData).map(piloto => ({
            piloto: piloto,
            pontos: pilotData[piloto].pontos,
            tipo: pilotData[piloto].tipo
        }));

        // Ordenar por pontos em ordem decrescente
        standings.sort((a, b) => b.pontos - a.pontos);

        // Armazenar todos os dados para filtragem
        allStandingsData = standings;

        // Converter pontuações de construtores para um array e ordenar
        const constructorStandings = Object.keys(constructorPoints).map(constructor => ({
            constructor: constructor,
            pontos: constructorPoints[constructor]
        }));

        constructorStandings.sort((a, b) => b.pontos - a.pontos);

        populateConstructorStandingsTable(constructorStandings);

        // Exibir o líder atual
        displayCurrentLeader(standings);

        // Preencher a tabela de classificação geral
        populateStandingsTable(standings, 'all');

        // Preencher os resultados por etapa
        populateRaceResults(allRaceData);
    }

    function displayCurrentLeader(standings) {
        const leaderDiv = document.getElementById('current-leader');
        if (standings.length > 0) {
            const leader = standings[0];
            leaderDiv.innerHTML = `<p><span class="pilot-name">${leader.piloto}</span> com <span class="points-total">${leader.pontos}</span> pontos!</p>`;
        } else {
            leaderDiv.innerHTML = `<p>Nenhum líder definido ainda.</p>`;
        }
    }

    function populateStandingsTable(standings, filter) {
        const tableBody = document.querySelector('#standings-table tbody');        
        tableBody.innerHTML = ''; // Limpa qualquer conteúdo existente

        standings.forEach((entry, index) => {            
            const row = tableBody.insertRow();

            if (index === 0) { // Adiciona classe para o líder
                row.classList.add('leader-row');
            }
            const posCell = row.insertCell();
            const pilotCell = row.insertCell();
            const pointsCell = row.insertCell();

            posCell.textContent = index + 1;
            pilotCell.textContent = entry.piloto;
            pointsCell.textContent = entry.pontos;
        });
    }

    function populateConstructorStandingsTable(constructorStandings) {
        const tableBody = document.querySelector('#constructors-table tbody');
        tableBody.innerHTML = '';

        constructorStandings.forEach((entry, index) => {
            const row = tableBody.insertRow();
            const posCell = row.insertCell();
            const constructorCell = row.insertCell();
            const pointsCell = row.insertCell();

            posCell.textContent = index + 1;
            constructorCell.textContent = entry.constructor;
            pointsCell.textContent = entry.pontos;
        });
    }
    
    function setupFilterButtons() {
        const buttons = document.querySelectorAll('.filter-buttons button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                const filteredStandings = filterStandings(filter);
                populateStandingsTable(filteredStandings, filter);
                // Remover classe 'active' de todos os botões e adicionar ao botão clicado
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    function filterStandings(filter) {
        if (filter === 'all') return allStandingsData;

        // Mapeia o valor do filtro ('human', 'ai') para o valor no JSON ('Pessoa', 'IA')
        if (filter === 'human') {
            return allStandingsData.filter(entry => entry.tipo === 'Pessoa');
        }
        if (filter === 'ai') {
            return allStandingsData.filter(entry => entry.tipo === 'IA');
        }
        return []; // Retorna um array vazio se o filtro não for reconhecido
    }






    function populateRaceResults(allRaceData) {
        const raceResultsContainer = document.getElementById('race-results-container');
        raceResultsContainer.innerHTML = ''; // Limpa qualquer conteúdo existente

        allRaceData.forEach(race => {
            const raceCard = document.createElement('div');
            raceCard.classList.add('race-card');

            const title = document.createElement('h3');
            title.textContent = `Etapa ${race.etapa}: ${race.circuito}`;
            raceCard.appendChild(title);

            // Cria uma tabela para os resultados dentro do card
            const resultsTable = document.createElement('table');
            resultsTable.classList.add('race-results-table');

            // Cria o cabeçalho da tabela
            resultsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Piloto</th>
                        <th>Tipo</th>
                        <th>Equipe</th>
                        <th>Pontos</th>
                    </tr>
                </thead>
            `;

            // Cria o corpo da tabela e preenche com os resultados
            const tbody = document.createElement('tbody');
            race.resultados.forEach(result => {
                const row = tbody.insertRow();
                const typeClass = result.tipo === 'Pessoa' ? 'type-human' : 'type-ai';
                row.innerHTML = `
                    <td>${result.pos}</td>
                    <td>${result.piloto}</td>
                    <td class="${typeClass}">${result.tipo}</td>
                    <td class="team-name">${result.equipe}</td>
                    <td class="points-cell">${result.pontos}</td>
                `;
            });
            resultsTable.appendChild(tbody);
            raceCard.appendChild(resultsTable);
            raceResultsContainer.appendChild(raceCard);
        });
    }

    function displayErrorMessage(message) {
        const mainContainer = document.querySelector('.container');
        mainContainer.innerHTML = `<p style="color: var(--f1-red); text-align: center; font-size: 1.2em;">${message}</p>`;
    }
});