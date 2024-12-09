document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('workout-form');
    const recordsList = document.getElementById('records-list');
    const modal = document.getElementById('exercise-modal');
    const exerciseNameInput = document.getElementById('exercise-name');
    const showExercisesBtn = document.getElementById('show-exercises');
    const closeBtn = modal.querySelector('.close-btn');
    const exerciseList = modal.querySelector('.exercise-list');
    const categoryBtns = modal.querySelectorAll('.category-btn');
    
    // 预定义的运动动作
    const exercises = {
        chest: ['平板卧推', '上斜卧推', '下斜卧推', '哑铃飞鸟', '器械夹胸'],
        back: ['引体向上', '划船', '高位下拉', '单臂哑铃划船', '硬拉'],
        legs: ['深蹲', '腿举', '腿屈伸', '小腿提升', '弓步走'],
        shoulders: ['肩推', '侧平举', '前平举', '后平举', '站姿推举'],
        arms: ['杠铃弯举', '三头下压', '锤式弯举', '绳索下压', '集中弯举']
    };
    
    // 显示弹框
    showExercisesBtn.addEventListener('click', () => {
        modal.classList.add('show');
        showExercises('chest'); // 默认显示胸部运动
    });
    
    // 关闭弹框
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
    
    // 点击弹框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    // 切换分类
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showExercises(btn.dataset.category);
        });
    });
    
    // 显示运动列表
    function showExercises(category) {
        exerciseList.innerHTML = '';
        exercises[category].forEach(exercise => {
            const div = document.createElement('div');
            div.className = 'exercise-item';
            div.textContent = exercise;
            div.addEventListener('click', () => {
                exerciseNameInput.value = exercise;
                exerciseNameInput.dispatchEvent(new Event('input', {
                    bubbles: true,
                    cancelable: true,
                }));
                modal.classList.remove('show');
            });
            exerciseList.appendChild(div);
        });
    }
    
    // 添加输入框值变化的监听
    exerciseNameInput.addEventListener('input', (e) => {
        const input = e.target;
        if (input.value.trim()) {
            input.classList.add('has-value');
        } else {
            input.classList.remove('has-value');
        }
    });
    
    // 从本地存储加载记录并确保每条记录都有日期
    let records = JSON.parse(localStorage.getItem('workoutRecords')) || [];
    // 修复旧数据，添加缺失的日期
    records = records.map(record => {
        if (!record.date) {
            return {
                ...record,
                date: new Date().toISOString()
            };
        }
        return record;
    });
    localStorage.setItem('workoutRecords', JSON.stringify(records));
    
    // 显示现有记录
    function displayRecords() {
        recordsList.innerHTML = '';
        
        // 按日期分组记录
        const groupedRecords = records.reduce((groups, record) => {
            const date = new Date(record.date || new Date());
            const dateStr = date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
            
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(record);
            return groups;
        }, {});

        // 按日期倒序排列
        const sortedDates = Object.keys(groupedRecords).sort((a, b) => {
            return new Date(groupedRecords[b][0].date) - new Date(groupedRecords[a][0].date);
        });

        sortedDates.forEach(dateStr => {
            const dateGroup = document.createElement('div');
            dateGroup.className = 'date-group';
            
            const dateHeader = document.createElement('div');
            dateHeader.className = 'date-header';
            dateHeader.textContent = dateStr;
            dateGroup.appendChild(dateHeader);

            const recordsContainer = document.createElement('div');
            recordsContainer.className = 'date-records';

            groupedRecords[dateStr].forEach((record) => {
                const recordElement = document.createElement('div');
                recordElement.className = 'record-item';
                recordElement.innerHTML = `
                    <div>
                        <strong>动作：</strong>${record.name} | 
                        <strong>组数：</strong>${record.sets} | 
                        <strong>重量：</strong>${record.weight}kg
                    </div>
                    <button class="delete-btn" onclick="deleteRecord(${records.indexOf(record)})">删除</button>
                `;
                recordsContainer.appendChild(recordElement);
            });

            dateGroup.appendChild(recordsContainer);
            recordsList.appendChild(dateGroup);
        });
    }
    
    // 添加新记录
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('exercise-name').value;
        const sets = document.getElementById('sets').value;
        const weight = document.getElementById('weight').value;
        
        const newRecord = {
            name,
            sets,
            weight,
            date: new Date().toISOString()
        };
        
        records.push(newRecord);
        localStorage.setItem('workoutRecords', JSON.stringify(records));
        
        displayRecords();
        form.reset();
        exerciseNameInput.classList.remove('has-value');
    });
    
    // 修改删除记录的函数，使用数组索引而不是日期
    window.deleteRecord = (index) => {
        if (index >= 0 && index < records.length) {
            records.splice(index, 1);
            localStorage.setItem('workoutRecords', JSON.stringify(records));
            displayRecords();
        }
    };
    
    // 初始显示记录
    displayRecords();
}); 