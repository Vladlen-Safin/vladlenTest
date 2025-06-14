import Select from "react-select";

const SmartSelect = ({ options, selectedProducts, setSelectedProducts, setPlaceholder, setIsMilti }) => {
    return (
        <Select
            options={options}
            isMulti={setIsMilti} // Включаем множественный выбор
            isSearchable // Включаем поиск
            onChange={setSelectedProducts} // Обновляем состояние
            value={selectedProducts}
            placeholder={setPlaceholder}
            className="smart-select"
        />
    );
};

export default SmartSelect;
