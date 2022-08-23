
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const q = urlParams.get('q');
const id = urlParams.get('id');
var lang = urlParams.get('lang');
var catId = urlParams.get('cat');
if (!lang) {
	lang = 'it';
}
var origin = window.location.origin;

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

function getValueLang(dict) {
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

function fixedEncodeURIComponent(str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, escape);
}

function getShareLink(question, catIdParam) {
	var parameters = "?id=" + question["id"] + "&lang=" + lang + "&cat=" + catIdParam;
	return origin + "/" + parameters;
}

function getHtmlQuestion(question, catIdParam) {
	var q = getValueLang(question["q"]);
	var html = "<div class='question'>";
	html += "<div class='dateAdded'>";
	html += "added " + printPrettyDate(question["addedDate"]);
	html += "</div>";
	html += "<div class='dateAdded'>";
	html += "lastEdited " + printPrettyDate(question["lastEdited"]);
	html += "</div>";
	html += "<div class='questionText'>";
	html += q;
	html += "</div>";

	html += "<div class='answer'>";
	html += getValueLang(question["a"]);
	html += "</div>";

	html += "<div class='shareAnswer'>";
	var link = getShareLink(question, catIdParam);
	html += "<a class='shareAnswer' href='" + link + "'>share this</a>";
	html += "</div>";

	html += "</div>";
	return html;
}

function getHtmlQuestions(questions, catIdParam) {
	var result = "";
	questions.forEach((question) => {
		result += getHtmlQuestion(question, catIdParam);
	});
	return result;
}

function getHtml(element) {
	var html = "<div>";
	html += "<div class='title'>";
	html += getValueLang(element["title"]);
	html += "</div>";

	html += "<div class='questions'>";
	html += getHtmlQuestions(element["questions"], element["id"]);
	html += "</div>";

	html += "</div>";
	return html;
}

var loadedJson = "";

function filterQuestionString(question, filterString) {
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

function filterQuestion(question, filterString, filterId) {

	if (filterString && filterId) {
		var resultFilterString = filterQuestionString(question, filterString);
		var resultFilterId = filterQuestionId(question, filterId);
		return resultFilterString && resultFilterId;
	}

	if (filterString) {
		return filterQuestionString(question, filterString);
	}

	if (filterId) {
		return filterQuestionId(question, filterId);
	}

	return true;
}

function filterQuestions(questions, filterString, filterId) {
	var resultQuestions = [];
	questions.forEach((element) => {
		var element2 = filterQuestion(element, filterString, filterId);
		if (element2)
			resultQuestions.push(element);
	});
	return resultQuestions;
}

function filterCategory(element, filterString, filterId) {
	var idCatElement = element["id"];
	if (catId)
	{
		if (idCatElement)
		{
			if (catId != idCatElement)
				return null;
		}
	}
	var questionsResult = filterQuestions(element["questions"], filterString, filterId);
	if (questionsResult && questionsResult.length > 0) {
		element["question"] = questionsResult;
		return element;
	}
	return null;
}

function filterList(loadedJson, filterString, filterId) {
	var result = [];
	loadedJson.forEach((element) => {
		var element2 = filterCategory(element, filterString, filterId);
		if (element2)
			result.push(element2);
	});
	return result;
}

function refreshFaq(filterString, filterId) {
	var docMain = document.getElementById("faqIdMain");
	var htmlResult = "";

	var filtered = filterList(loadedJson, filterString, filterId);

	if (filtered && filtered.length > 0) {
		filtered.forEach((element) => {
			var html = getHtml(element);
			htmlResult += html;
		});
		docMain.innerHTML = htmlResult;
	}
	else {
		var html = "<div><p>Nessun risultato</p>";
		html += "<p><a href='" + origin + "'>Torna indietro</a></p>";
		html += "</div>";
		docMain.innerHTML = html;
	}
}

document.addEventListener("DOMContentLoaded", function () {
	var urlJson = "./assets/faq.json";


	var docSearchContainer = document.getElementById("searchBar");
	var docSearch = document.getElementById("searchBarMain");

	if (id) {
		docSearchContainer.style.display = "none";
	}
	else {
		docSearch.addEventListener('input', function (e) {
			var value = e.target.value;
			//console.log(value);
			refreshFaq(value, id);
		});
	}


	$.getJSON(urlJson, function (dataFromJson) {
		loadedJson = dataFromJson;
		refreshFaq(q, id);

	});

	if (q) {
		docSearch.value = q;
	}



});