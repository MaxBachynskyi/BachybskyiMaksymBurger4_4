import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", ()=>{
    'use strict'

    const btnOpenModal = document.querySelector("#btnOpenModal");
    const modalBlock = document.querySelector("#modalBlock");
    const closeModal = document.querySelector("#closeModal");
    const questionTitle = document.querySelector('#question');
    const formAnswers = document.querySelector("#formAnswers");
    const prevButton = document.querySelector("#prev");
    const nextButton = document.querySelector("#next");
    const sendButton = document.querySelector("#send");

    const firebaseConfig = {
      apiKey: "AIzaSyAMkrbMYc3Qprv7DRpLc1_rU7y_SYrxtZE",
      authDomain: "burgerfirebase-36ae4.firebaseapp.com",
      databaseURL: "https://burgerfirebase-36ae4-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "burgerfirebase-36ae4",
      storageBucket: "burgerfirebase-36ae4.firebasestorage.app",
      messagingSenderId: "724909459814",
      appId: "1:724909459814:web:5b7360e33f729bf4a360a7",
      measurementId: "G-09H2QMD60M"
      };

      const app = initializeApp(firebaseConfig);
      const db = getDatabase(app);


    const getData = () => {
      formAnswers.textContent = 'LOAD';
      prevButton.classList.add('d-none');
      nextButton.classList.add('d-none');

      setTimeout(() => {
      const questionsRef = ref(db, "questions");

      get(questionsRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();

            const questionsArray = Array.isArray(data)
              ? data
              : Object.values(data);

            playTest(questionsArray);
          } else {
            formAnswers.textContent = 'Питань немає';
          }
        })
        .catch(error => {
          formAnswers.textContent = 'Помилка завантаження';
          console.error(error);
        });
      }, 1000) 
    }

    btnOpenModal.addEventListener("click", ()=>{
        modalBlock.classList.add('d-block');
        getData();
    })

    closeModal.addEventListener("click", ()=>{
        modalBlock.classList.remove('d-block');
    })

    const playTest = (questions)=>{

      let finalAnswers = [];

      let numberQuestion = 0;
      
      const renderAnswers=(index)=>{
        questions[index].answers.forEach((answer)=>{
          const answerItem = document.createElement('div');
          answerItem.classList.add('answers-item', 'd-flex', 'flex-column');

          answerItem.innerHTML = `
          <input type=${questions[index].type} id=${answer.title} name="answer" value=${answer.title} class="d-none">
          <label for=${answer.title} class="d-flex flex-column justify-content-between">
            <img class="answerImg" src="${answer.url}" alt="burger">
            <span>${answer.title}</span>
          </label>
          `

          formAnswers.appendChild(answerItem);
        })

      };

      const renderQuestions = (indexQuestion) => {
        formAnswers.innerHTML = '';

        switch (true) {
          case numberQuestion === 0:
            questionTitle.textContent = questions[indexQuestion].question;
            renderAnswers(indexQuestion);

            prevButton.classList.add('d-none');
            nextButton.classList.remove('d-none');
            sendButton.classList.add('d-none');
            break;

          case numberQuestion > 0 && numberQuestion < questions.length:
            questionTitle.textContent = questions[indexQuestion].question;
            renderAnswers(indexQuestion);

            prevButton.classList.remove('d-none');
            nextButton.classList.remove('d-none');
            sendButton.classList.add('d-none');
            break;

          case numberQuestion === questions.length:
            questionTitle.textContent = '';

            prevButton.classList.add('d-none');
            nextButton.classList.add('d-none');
            sendButton.classList.remove('d-none');

            formAnswers.innerHTML = `
              <div class="input-group-prepend"> <span class="input-group-text" id="NumberPhon">Введіть номер телефону</span> </div> <input type="text" id="NumberPhon" class="form-control" placeholder="Номер телефону" aria-label="Username" aria-describedby="basic-addon1"> </div>
            `;
            break;

          case numberQuestion === questions.length + 1:
            questionTitle.textContent = '';
            formAnswers.innerHTML =
              'Дякуємо за вибір! Наш менеджер Вам зателефонує!';

            prevButton.classList.add('d-none');
            nextButton.classList.add('d-none');
            sendButton.classList.add('d-none');

            setTimeout(() => {
              modalBlock.classList.remove('d-block');
            }, 2000);
            break;
        }
      };


      const checkAnswers = ()=>{
        const obj = {};

        const inputs = [...formAnswers.elements].filter((input)=>input.checked || input.id==="NumberPhon")

        inputs.forEach((input, index)=>{
          if (numberQuestion >= 0 && numberQuestion <= questions.length - 1){
            obj[`${index}_${questions[numberQuestion].question}`] = input.value;
          }
          if(numberQuestion === questions.length){
            obj[`Number Phone`] = input.value;
          }

        });

        finalAnswers.push(obj);
        console.log(finalAnswers);

      };

      prevButton.onclick = ()=>{
          numberQuestion--;
          renderQuestions(numberQuestion);

      };

      nextButton.onclick = ()=>{
          checkAnswers();
          numberQuestion++;
          renderQuestions(numberQuestion);
      };

      sendButton.onclick = () => {
        checkAnswers();
        numberQuestion++;
        renderQuestions(numberQuestion);

        const contactsRef = ref(db, 'contacts');

        push(contactsRef, {
          answers: finalAnswers,
          createdAt: Date.now()
        })
        .then(() => {
          console.log('Дані успішно збережені');
        })
        .catch(err => {
          console.error('Помилка збереження:', err);
        });
      };

      renderQuestions(numberQuestion)
    }

})