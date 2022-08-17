function printPrettyDate(date) {
	var dateSplitted = date.split("T");
	var dateSplitted2 = dateSplitted[0].split("-");
	var dateSplitted3 = dateSplitted[1].split(":");
	var year = parseInt(dateSplitted2[0]);
	var month = parseInt(dateSplitted2[1]);
	var day = parseInt(dateSplitted2[2]);
	var hour = parseInt(dateSplitted3[0]);
	var minute = parseInt(dateSplitted3[1]);
	var second = parseInt(dateSplitted3[2]);

	var dateTime = new Date(year, month, day, hour, minute, second);
	var now = Date.now();
	var diffMilliseconds = Math.abs(now - dateTime);
	var diffYear = diffMilliseconds / (1000 * 60 * 60 * 24 * 365);
	if (diffYear >= 1)
		return month + "/" + year;

	var diffMonth = diffMilliseconds / (1000 * 60 * 60 * 24 * 365 / 12);
	if (diffMonth >= 1)
		return day + "/" + month + "/" + year;

	var diffDay = diffMilliseconds / (1000 * 60 * 60 * 24);
	if (diffDay >= 1)
		return day + "/" + month + "/" + year + " " + String(hour).padEnd(2, '0') + ":" + String(minute).padEnd(2, '0');

	return day + "/" + month + "/" + year + " " + String(hour).padEnd(2, '0') + ":" + String(minute).padEnd(2, '0') + ":" + String(second).padEnd(2, '0');
}

function getValueLang(dict, lang) {
	var s = dict[lang];
	if (s)
		return s;

	var keys = Object.keys(dict);
	if (keys && keys.length > 0) {
		for (key in keys) {
			var s2 = dict[keys[key]];
			if (s2)
				return s2;
		}
	}

	return "[text not present]";
}

function getHtmlQuestion(question, lang) {
	var q = getValueLang(question["q"], lang);
	var html = "<div class='question'>";
	html += "<div class='dateAdded'>";
	html += "addedDate " + printPrettyDate(question["addedDate"]);
	html += "</div>";
	html += "<div class='dateAdded'>";
	html += "lastEdited " + printPrettyDate(question["lastEdited"]);
	html += "</div>";
	html += "<div class='questionText'>";
	html += q;
	html += "</div>";

	html += "<div class='answer'>";
	html += getValueLang(question["a"], lang);
	html += "</div>";
	html += "</div>";
	return html;
}

function getHtmlQuestions(questions, lang) {
	var result = "";
	questions.forEach((question) => {
		result += getHtmlQuestion(question, lang);
	});
	return result;
}

function getHtml(element, lang) {
	var html = "<div>";
	html += "<div class='title'>";
	html += getValueLang(element["title"], lang);
	html += "</div>";

	html += "<div class='questions'>";
	html += getHtmlQuestions(element["questions"], lang);
	html += "</div>";

	html += "</div>";
	return html;
}

var loadedJson = "";

function filterQuestionString(question, filterString, lang) {
	if (filterString) {
		var q = question["q"][lang].toUpperCase();
		filterString = filterString.toUpperCase().trim();
		var result = q.includes(filterString);

		if (result) {
			return true;
		}

		var array = filterString.split(' ').filter((elementWord) => {
			elementWord = elementWord.trim();
			if (elementWord && elementWord.length > 0)
				return true;
			return false;
		});;
		var array2 = array.filter((elementWord) => {
			elementWord = elementWord.trim();
			return q.includes(elementWord);
		});

		if (array2 && array2.length > 0 && array2.length >= array.length * 0.75)
			return true;
		else
			return false;
	}
	return true;
}

function filterQuestionId(question, filterId) {
	if (filterId) {
		var id = question["id"];
		if (id == filterId)
			return true;
		return false;
	}
	return true;
}

function filterQuestion(question, filterString, filterId, lang) {

	if (filterString && filterId) {
		var resultFilterString = filterQuestionString(question, filterString, lang);
		var resultFilterId = filterQuestionId(question, filterId);
		return resultFilterString && resultFilterId;
	}

	if (filterString) {
		return filterQuestionString(question, filterString, lang);
	}

	if (filterId) {
		return filterQuestionId(question, filterId);
	}

	return true;
}

function filterQuestions(questions, filterString, filterId, lang) {
	var resultQuestions = [];
	questions.forEach((element) => {
		var element2 = filterQuestion(element, filterString, filterId, lang);
		if (element2)
			resultQuestions.push(element);
	});
	return resultQuestions;
}

function filterCategory(element, filterString, filterId, lang) {
	var questionsResult = filterQuestions(element["questions"], filterString, filterId, lang);
	if (questionsResult && questionsResult.length > 0) {
		element["question"] = questionsResult;
		return element;
	}
	return null;
}

function filterList(loadedJson, filterString, filterId, lang) {
	var result = [];
	loadedJson.forEach((element) => {
		var element2 = filterCategory(element, filterString, filterId, lang);
		if (element2)
			result.push(element2);
	});
	return result;
}

function refreshFaq(filterString, filterId, lang) {
	var docMain = document.getElementById("faqIdMain");
	var htmlResult = "";

	var filtered = filterList(loadedJson, filterString, filterId, lang);

	if (filtered && filtered.length > 0) {
		filtered.forEach((element) => {
			var html = getHtml(element, lang);
			htmlResult += html;
		});
		docMain.innerHTML = htmlResult;
	}
	else {
		docMain.innerHTML = "Nessun risultato.";
	}
}

document.addEventListener("DOMContentLoaded", function () {
	var urlJson = "./assets/faq.json";
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const q = urlParams.get('q');
	const id = urlParams.get('id');
	var lang = urlParams.get('lang')
	if (!lang) {
		lang = 'it';
	}

	var docSearchContainer = document.getElementById("searchBar");
	var docSearch = document.getElementById("searchBarMain");

	if (id) {
		docSearchContainer.style.display = "none";
	}
	else {
		docSearch.addEventListener('input', function (e) {
			var value = e.target.value;
			//console.log(value);
			refreshFaq(value, id, lang);
		});
	}


	$.getJSON(urlJson, function (dataFromJson) {
		loadedJson = dataFromJson;
		refreshFaq(q, id, lang);

	});

	if (q) {
		docSearch.value = q;
	}



});