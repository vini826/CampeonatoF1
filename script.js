document.addEventListener('DOMContentLoaded', () => {
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
            } else {
                displayErrorMessage("Nenhum dado de pontuação encontrado.");
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);
            displayErrorMessage("Erro ao carregar os dados de pontuação. Verifique o arquivo 'pontuacoes.json'.");
        });

    function processData(allRaceData) {
        const pilotPoints = {}; // Objeto para armazenar a pontuação total de cada piloto

        // Calcular pontuação total para cada piloto
        allRaceData.forEach(race => {
            race.resultados.forEach(result => {
                if (pilotPoints[result.piloto]) {
                    pilotPoints[result.piloto] += result.pontos;
                } else {
                    pilotPoints[result.piloto] = result.pontos;
                }
            });
        });

        // Converter para um array para facilitar a ordenação
        const standings = Object.keys(pilotPoints).map(piloto => ({
            piloto: piloto,
            pontos: pilotPoints[piloto]
        }));

        // Ordenar por pontos em ordem decrescente
        standings.sort((a, b) => b.pontos - a.pontos);

        // Exibir o líder atual
        displayCurrentLeader(standings);

        // Preencher a tabela de classificação geral
        populateStandingsTable(standings);

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

    function populateStandingsTable(standings) {
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

    function populateRaceResults(allRaceData) {
        const raceResultsContainer = document.getElementById('race-results-container');
        raceResultsContainer.innerHTML = ''; // Limpa qualquer conteúdo existente

        allRaceData.forEach(race => {
            const raceCard = document.createElement('div');
            raceCard.classList.add('race-card');

            const title = document.createElement('h3');
            title.textContent = `Etapa ${race.etapa}: ${race.circuito}`;
            raceCard.appendChild(title);

            const resultsList = document.createElement('ul');
            race.resultados.forEach(result => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<span class="pilot-name-result">${result.piloto}</span> <span class="points-result">${result.pontos} pts</span>`;
                resultsList.appendChild(listItem);
            });
            raceCard.appendChild(resultsList);
            raceResultsContainer.appendChild(raceCard);
        });
    }

    function displayErrorMessage(message) {
        const mainContainer = document.querySelector('.container');
        mainContainer.innerHTML = `<p style="color: var(--f1-red); text-align: center; font-size: 1.2em;">${message}</p>`;
    }
});