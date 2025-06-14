import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./analytics.css";
import {
    BarChart, Bar, CartesianGrid, XAxis, YAxis, PieChart, Pie, Tooltip, Cell, ResponsiveContainer, LineChart, Line
} from "recharts";
export default function AnalyticsComp() {
    const [statsCheck, setStatsCheck] = useState(null);
    const [statsTopProduct, setStatsTopProduct] = useState(null);
    const [statsTopGroup, setStatsTopGroup] = useState(null);
    const [statsTopSubGroup, setStatsTopSubGroup] = useState(null);
    const [statsSeasonality, setStatsSeasonality] = useState(null);
    const [trafficData, setStatsTrafic] = useState(null);
    const [activeIndex, setActiveIndex] = useState(-1);

    // Состояния для выбора даты
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1))); // По умолчанию месяц назад
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                };

                const [checkStatsRes, topProductsRes, topGroupsRes, topSubGroupsRes, trafficRes, seasonalityRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BACKEND}analytics/check-stats`, { params }),
                    axios.get(`${process.env.REACT_APP_BACKEND}analytics/top-products`, { params }),
                    axios.get(`${process.env.REACT_APP_BACKEND}analytics/top-groups`, { params }),
                    axios.get(`${process.env.REACT_APP_BACKEND}analytics/top-subgroups`, { params }),
                    axios.get(`${process.env.REACT_APP_BACKEND}analytics/traffic`, { params }),
                    axios.get(`${process.env.REACT_APP_BACKEND}analytics/seasonality`, { params })
                ]);

                setStatsCheck(checkStatsRes.data);
                setStatsTopProduct(topProductsRes.data);
                setStatsTopGroup(topGroupsRes.data);
                setStatsTopSubGroup(topSubGroupsRes.data);
                setStatsTrafic(trafficRes.data);
                setStatsSeasonality(seasonalityRes.data);
            } catch (error) {
                console.error("Ошибка при загрузке статистики", error);
            }
        };

        fetchData();
    }, [startDate, endDate]); // Вызываем при изменении дат

    if (!statsCheck || !statsTopProduct) return <p>Загрузка данных...</p>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    // Преобразование данных в формат для Recharts
    const daysMap = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

    // Группировка по дням недели
    const trafficByDay = trafficData.reduce((acc, item) => {
        const dayName = daysMap[item._id.day];
        acc[dayName] = (acc[dayName] || 0) + item.count;
        return acc;
    }, {});

    const dayChartData = Object.keys(trafficByDay).map(day => ({
        day,
        count: trafficByDay[day],
    }));

    // Группировка по часам
    const trafficByHour = trafficData.reduce((acc, item) => {
        const hour = item._id.hour;
        acc[hour] = (acc[hour] || 0) + item.count;
        return acc;
    }, {});

    const hourChartData = Object.keys(trafficByHour).map(hour => ({
        hour: `${hour}:00`,
        count: trafficByHour[hour],
    }));
    
    return (
        <>
        <div className="analiticblock">
        <div className="date-picker-container">
            {/* Выбор даты */}
                <label>Начало:</label>
                <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} dateFormat="yyyy-MM-dd" />
                <label>Конец:</label>
                <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} dateFormat="yyyy-MM-dd" />
            </div>

            <div className="analytics-container">
                {/* Гистограмма */}
                <div className="chart-container">
                <h2 className="chart-title">Статистика транзакций</h2>
                <ResponsiveContainer>
                <BarChart data={[
                            { name: "Мин. чек", amount: statsCheck.minCheck },
                            { name: "Сред. чек", amount: statsCheck.averageCheck },
                            { name: "Макс. чек", amount: statsCheck.maxCheck },
                        ]}>
                <Bar dataKey="amount" fill="green" />
                            <CartesianGrid stroke="#ccc" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Круговая диаграмма */}
                <div className="chart-container">
                <h2 className="chart-title">Статистика по продуктам</h2>
                <ResponsiveContainer>
                        <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            data={statsTopProduct}
                            dataKey="totalQuantity"
                            outerRadius={80}
                            fill="green"
                            onMouseEnter={onPieEnter}
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            {statsTopProduct.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Круговая диаграмма */}
                <div className="chart-container">
                <h2 className="chart-title">Статистика по группам</h2>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            data={statsTopGroup}
                            dataKey="totalSales"
                            outerRadius={80}
                            fill="green"
                            onMouseEnter={onPieEnter}
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            {statsTopGroup.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Круговая диаграмма */}
                <div className="chart-container">
                <h2 className="chart-title">Статистика по подгруппам</h2>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            data={statsTopSubGroup}
                            dataKey="totalSales"
                            outerRadius={80}
                            fill="green"
                            onMouseEnter={onPieEnter}
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            {statsTopSubGroup.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* ГРафики траффика по часам и дням */}
                <div className="chart-container">
                <h2 className="chart-title">Трафик по дням недели</h2>
                    <ResponsiveContainer>
                        <BarChart data={dayChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* График трафика по часам */}
                <div className="chart-container">
                <h2 className="chart-title">Трафик по часам</h2>
                    <ResponsiveContainer>
                        <LineChart data={hourChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Круговая диаграмма */}
                <div className="chart-container">
                <h2 className="chart-title">Статистика покупок по сезонам</h2>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            data={statsSeasonality}
                            dataKey="count"
                            outerRadius={80}
                            fill="green"
                            onMouseEnter={onPieEnter}
                            style={{ cursor: 'pointer', outline: 'none' }}
                        >
                            {statsSeasonality.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
         </div>
        </>
    );
}
