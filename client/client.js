const statusTitles = {
    200: 'Success',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    404: 'Resource Not Found',
};

const handleResponse = (response) => {
    const contentType = response.headers.get('content-type') || '';
    return response.text().then((raw) => {
        console.log(raw);
        let data;
        if (contentType.includes('xml')) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(raw, 'text/xml');
            const messageNode = xmlDoc.querySelector('message');
            const idNode = xmlDoc.querySelector('id');
            data = {
                message: messageNode ? messageNode.textContent : '',
                id: idNode ? idNode.textContent : null,
            };
        } else {
            data = JSON.parse(raw);
        }
        const content = document.querySelector('#content');
        const title = statusTitles[response.status] || `Status ${response.status}`;
        content.innerHTML = `<h1>${title}</h1><p>Message: ${data.message}</p>`;
    });
};

const sendAjaxRequest = (e) => {
    e.preventDefault();
    const pageSelect = document.querySelector('#page');
    const typeSelect = document.querySelector('#type');
    const page = pageSelect.options[pageSelect.selectedIndex].value;
    const accept = typeSelect.options[typeSelect.selectedIndex].value;

    fetch(page, { headers: { accept } })
        .then(handleResponse)
        .catch((err) => console.log(err));
};

const init = () => {
    document.querySelector('#send').addEventListener('click', sendAjaxRequest);
};

window.onload = init;