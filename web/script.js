
let pieChart, columnChart, lineChart, columnChart2, barChart;


document.getElementById('csvFile').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const csvData = e.target.result;
            processData(csvData);
        };
        reader.readAsText(file);
    }
}


function processData(csvData) {
   
    // CSV verilerini işle
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');
    const data = [];
    const data2=[];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        data.push({
            Year: parseInt(row[6]), // Year sütunu
            Month: parseInt(row[7]),
        });

    }

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        data2.push({
            Year: parseInt(row[6]), // Year sütunu
            Month: parseInt(row[7]), // Month sütunu
            Day: parseInt(row[8]), // Day sütunu
        });
    }

    const countByDate = {};

    data2.forEach((item) => {
        const dateKey = `${item.Year}-${item.Month}-${item.Day}`;
        if (!countByDate[dateKey]) {
            countByDate[dateKey] = 0;
        }
        countByDate[dateKey]++;
    });

    // Çizgi grafiği oluşturmak için tarihleri ve sayıları ayarlayalım
    const dates = Object.keys(countByDate);
    const counts = dates.map((date) => countByDate[date]);



    // Aylara ve yıllara göre sayımı hesapla
    const countByYearMonth = {};

    data.forEach((item) => {
        const year = item.Year;
        const month = item.Month;

        if (!countByYearMonth[year]) {
            countByYearMonth[year] = {};
        }

        countByYearMonth[year][month] = (countByYearMonth[year][month] || 0) + 1;
    });

    // Mevsimlere göre sayımı hesapla
    const countBySeason = {
        "Winter": 0,
        "Spring": 0,
        "Summer": 0,
        "Fall": 0
    };

    data.forEach((item) => {
        const month = item.Month;
        if (month >= 1 && month <= 2 || month === 12) {
            countBySeason["Winter"] += 1;
        } else if (month >= 3 && month <= 5) {
            countBySeason["Spring"] += 1;
        } else if (month >= 6 && month <= 8) {
            countBySeason["Summer"] += 1;
        } else {
            countBySeason["Fall"] += 1;
        }
    });

    // Tarihleri ve sayıları saklamak için bir obje oluşturalım
    const countByDate2 = {};
    data2.forEach((item) => {
        // Tarih bilgilerini hafta-yıl formatına çevirelim
        const date = new Date(item.Year, item.Month - 1, item.Day);
        const weekYear = getWeekYear(date);
        
        if (!countByDate2[weekYear]) {
            countByDate2[weekYear] = 0;
        }
        countByDate2[weekYear]++;
    });
    const weekYears = Object.keys(countByDate2);
    const counts2 = weekYears.map((weekYear) => countByDate2[weekYear]);


    const countByYear={}
    data2.forEach((item) => {
        const year = item.Year;
        if (!countByYear[year]) {
            countByYear[year] = 0;
        }
        countByYear[year]++;
    });
    const years2 = Object.keys(countByYear);
    const yearCounts = years2.map((year) => countByYear[year]);


    // Grafik oluştur
    createColumnChart(countByYearMonth);
    createPieChart(countBySeason);
    createLineChart(dates, counts);
    createColumnChart2(weekYears, counts2);
    createBarChart(years2, yearCounts);
}


function createPieChart(countBySeason) {
    const ctx = document.getElementById('myPieChart').getContext('2d');
    const colors = ['#7fff00', '#ff1493', '#00bfff', '#ffff00'];
    const labels = Object.keys(countBySeason);
    const data = Object.values(countBySeason);

    if (pieChart) {
        pieChart.destroy(); // Mevcut grafik yok et
    }

    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: colors,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });

    pieChart.update(); 
}


function createColumnChart(countByYearMonth) {
    const ctx = document.getElementById('myChart').getContext('2d');
    const years = Object.keys(countByYearMonth);
    const months = Array.from(new Set([].concat(...years.map(year => Object.keys(countByYearMonth[year])))));
    const datasetData = [];
    const datasetLabels = [];

    const sortedMonths = formatAndSortDates(months);

   sortedMonths.forEach((month)  =>  {
    datasetLabels.push(getMonthName(month));
    const monthData = years.map((year)  => countByYearMonth[year][month] || 0);
    datasetData.push(monthData)
   })

    if (columnChart) {
        columnChart.destroy(); // Mevcut grafik yok et
    }

 

    columnChart = new Chart(ctx, {
        type: 'bar', // 'bar' türü, sutun (column) grafik oluşturur
        data: {
            labels: datasetLabels,
            datasets: years.map((year, index) => ({
                label: year,
                data: datasetData.map((data) => data[index]),
                backgroundColor: getRandomColor(), // Rasgele renk atamak için bir yardımcı işlev kullanabilirsiniz.
                borderWidth: 1,
            })),
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });

    columnChart.update(); 
}

function formatAndSortDates(data){
    return data.sort((a,b)  => a-b);
}

function getMonthName(month) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1];
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


//günlük bisiklet sayısı
function createLineChart(dates, counts) {
    const ctx = document.getElementById('myLineChart').getContext('2d');

    if (lineChart) {
        lineChart.destroy(); // Mevcut grafik yok et
    }

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates, // Tarihleri x eksenine yerleştirin
            datasets: [
                {
                    label: 'Gunluk Bisiklet Sayisi',
                    data: counts, // Sayıları y eksenine yerleştirin
                    borderColor: 'blue',
                    borderWidth: 1,
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
    lineChart.update(); 
}


// Verilen tarihin hafta-yıl formatını döndüren yardımcı bir fonksiyon
function getWeekYear(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}


//haftalık bisiklet sayısı sütun grafiği
function createColumnChart2(weekYears, counts) {
    const ctx = document.getElementById('myColumnChart2').getContext('2d');

    if (columnChart2) {
        columnChart2.destroy(); // Mevcut grafik yok et
    }

    columnChart2 = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weekYears, // Hafta-yıl bilgilerini x eksenine yerleştirin
            datasets: [
                {
                    label: 'Haftalik Bisiklet Sayisi',
                    data: counts, // Sayıları y eksenine yerleştirin
                    borderColor: 'red',
                    borderWidth: 1,
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
    columnChart2.update(); 
}

function createBarChart(years, yearCounts) {
   
    const ctx = document.getElementById('myBarChart').getContext('2d');

    if (barChart) {
        barChart.destroy(); // Mevcut grafik yok et
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years, // Yılları x eksenine yerleştirin
            datasets: [
                {
                    label: 'Yıllık Bisiklet Sayısı',
                    data: yearCounts, // Sayıları y eksenine yerleştirin
                    backgroundColor: ['#7cfc00','#cd00cd'],// Renkler
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
    barChart.update(); 
}

document.addEventListener("DOMContentLoaded", function () {
    // Menü bağlantılarına tıklanınca kaydırma işlemi
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

