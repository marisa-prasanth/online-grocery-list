document.addEventListener('DOMContentLoaded', () => {
 
  const groceryInput = document.getElementById('grocery-input');
  const addBtn = document.getElementById('add-btn');
  const groceryList = document.getElementById('grocery-list');
  const shareBtn = document.getElementById('share-btn');

  
  loadItems();

 
  addBtn.addEventListener('click', addItem);
  groceryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });
  shareBtn.addEventListener('click', shareList);

  
  function addItem() {
    const itemText = groceryInput.value.trim();
    if (!itemText) return;

    const item = {
      id: Date.now(),
      text: itemText,
      completed: false
    };

    saveItem(item);
    renderItem(item);
    groceryInput.value = '';
    groceryInput.focus();
  }

  function renderItem(item) {
    const li = document.createElement('li');
    li.className = 'grocery-item';
    li.dataset.id = item.id;

    const itemText = document.createElement('span');
    itemText.textContent = item.text;
    if (item.completed) itemText.classList.add('completed');

    itemText.addEventListener('click', () => {
      item.completed = !item.completed;
      itemText.classList.toggle('completed');
      updateStorage();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      li.remove();
      removeItem(item.id);
    });

    li.appendChild(itemText);
    li.appendChild(deleteBtn);
    groceryList.appendChild(li);
  }

 
  function getItems() {
    const storedItems = localStorage.getItem('groceryItems');
    return storedItems ? JSON.parse(storedItems) : [];
  }

  function saveItem(newItem) {
    const items = getItems();
    items.push(newItem);
    localStorage.setItem('groceryItems', JSON.stringify(items));
  }

  function loadItems() {
    const items = getItems();
    items.forEach(renderItem);
  }

  function removeItem(id) {
    const items = getItems().filter(item => item.id !== id);
    localStorage.setItem('groceryItems', JSON.stringify(items));
  }

  function updateStorage() {
    const items = Array.from(document.querySelectorAll('.grocery-item')).map(li => ({
      id: parseInt(li.dataset.id),
      text: li.querySelector('span').textContent,
      completed: li.querySelector('span').classList.contains('completed')
    }));
    localStorage.setItem('groceryItems', JSON.stringify(items));
  }

 
  function shareList() {
    const items = getItems();
    if (items.length === 0) {
      alert("Your grocery list is empty! Add some items first.");
      return;
    }

    const listText = formatListText(items);
    
    if (navigator.share) {
     
      navigator.share({
        title: 'My Grocery List',
        text: listText
      }).catch(err => {
        console.log('Share cancelled:', err);
        fallbackShare(listText);
      });
    } else {
      
      fallbackShare(listText);
    }
  }

  function formatListText(items) {
    let text = "🛒 My Grocery List:\n";
    items.forEach((item, index) => {
      text += `${index + 1}. ${item.text}${item.completed ? ' ✔️' : ''}\n`;
    });
    return text;
  }

  function fallbackShare(text) {
    
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('List copied to clipboard! You can now paste it anywhere.');
      } else {
        prompt('Copy your grocery list:', text);
      }
    } catch (err) {
      prompt('Copy your grocery list:', text);
    }
    
    document.body.removeChild(textarea);
    
   
    if (confirm('Would you like to share via WhatsApp?')) {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }
});