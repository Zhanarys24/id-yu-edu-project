'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'

export default function YessenovAIComingSoonPage() {
  const { t } = useTranslation('common')
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Примерная дата запуска
  const launchDate = new Date('2024-12-31T00:00:00').getTime()

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = launchDate - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [launchDate])

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-1">
        <div className="max-w-6xl w-full">
          {/* Заголовки - УМЕНЬШЕНЫ ОТСТУПЫ */}
          <div className="text-center mb-4">
            <h1 className="text-6xl font-bold text-gray-800 mt-5 mb-1">
              YessenovAI
            </h1>
            <h2 className="text-3xl font-semibold text-indigo-600 mb-1">
              Скоро запуск!
            </h2>
            <p className="text-xl text-gray-600 mb-1 max-w-2xl mx-auto">
              Мы работаем над созданием интеллектуального помощника YessenovAI, 
              который поможет вам в решении различных задач и ответит на ваши вопросы.
            </p>
          </div>

          {/* Контент и анимация на одном уровне */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-5">
            {/* Анимированный персонаж */}
            <div className="flex-shrink-0">
              <div className="error404page">
                <div className="newcharacter404">
                  <div className="chair404"></div>
                  <div className="leftshoe404"></div>
                  <div className="rightshoe404"></div>
                  <div className="legs404"></div>
                  <div className="torso404">
                    <div className="body404"></div>
                    <div className="leftarm404"></div>
                    <div className="rightarm404"></div>
                    <div className="head404">
                      <div className="eyes404"></div>
                    </div>
                  </div>
                  <div className="laptop404"></div>
                </div>
              </div>
            </div>

            {/* Описание функций */}
            <div className="flex-1 max-w-lg">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  Что будет в YessenovAI?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Умные ответы</h4>
                      <p className="text-gray-600 text-sm">Получайте точные и полезные ответы на ваши вопросы</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Помощь в учебе</h4>
                      <p className="text-gray-600 text-sm">Ассистент поможет с учебными задачами и проектами</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">24/7 доступность</h4>
                      <p className="text-gray-600 text-sm">Получайте помощь в любое время дня и ночи</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Персонализация</h4>
                      <p className="text-gray-600 text-sm">Адаптируется под ваши потребности и предпочтения</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS стили для анимации */}
        <style jsx>{`
          .error404page {
            width: 400px;
            height: 800px;
            position: relative;
            transform: scale(0.5);
          }

          .body404,
          .head404,
          .eyes404,
          .leftarm404,
          .rightarm404,
          .chair404,
          .leftshoe404,
          .rightshoe404,
          .legs404,
          .laptop404 {
            background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/15979/404-character-new.png) 0 0 no-repeat;
            width: 200px;
            height: 200px;
          }

          .newcharacter404,
          .torso404,
          .body404,
          .head404,
          .eyes404,
          .leftarm404,
          .rightarm404,
          .chair404,
          .leftshoe404,
          .rightshoe404,
          .legs404,
          .laptop404 {
            background-size: 750px;
            position: absolute;
            display: block;
          }

          .newcharacter404 {
            width: 400px;
            height: 800px;
            left: 50%;
            top: 20px;
            margin-left: -200px;
          }

          .torso404 {
            position: absolute;
            display: block;
            top: 138px;
            left: 0px;
            width: 389px;
            height: 252px;
            animation: sway 20s ease infinite;
            transform-origin: 50% 100%;
          }

          .body404 {
            position: absolute;
            display: block;
            top: 0px;
            left: 0px;
            width: 389px;
            height: 253px;
          }

          .head404 {
            position: absolute;
            top: -148px;
            left: 106px;
            width: 160px;
            height: 194px;
            background-position: 0px -265px;
            transform-origin: 50% 85%;
            animation: headTilt 20s ease infinite;
          }

          .eyes404 {
            position: absolute;
            top: 92px;
            left: 34px;
            width: 73px;
            height: 18px;
            background-position: -162px -350px;
            animation: blink404 10s steps(1) infinite, pan 10s ease-in-out infinite;
          }

          .leftarm404 {
            position: absolute;
            top: 159px;
            left: 0;
            width: 165px;
            height: 73px;
            background-position: -265px -341px;
            transform-origin: 9% 35%;
            transform: rotateZ(0deg);
            animation: typeLeft 0.4s linear infinite;
          }

          .rightarm404 {
            position: absolute;
            top: 148px;
            left: 231px;
            width: 157px;
            height: 91px;
            background-position: -442px -323px;
            transform-origin: 90% 25%;
            animation: typeRight 0.4s linear infinite;
          }

          .chair404 {
            position: absolute;
            top: 430px;
            left: 55px;
            width: 260px;
            height: 365px;
            background-position: -12px -697px;
          }

          .legs404 {
            position: absolute;
            top: 378px;
            left: 4px;
            width: 370px;
            height: 247px;
            background-position: -381px -443px;
          }

          .leftshoe404 {
            position: absolute;
            top: 591px;
            left: 54px;
            width: 130px;
            height: 92px;
            background-position: -315px -749px;
          }

          .rightshoe404 {
            position: absolute;
            top: 594px;
            left: 187px;
            width: 135px;
            height: 81px;
            background-position: -453px -749px;
            transform-origin: 35% 12%;
            animation: tapRight 1s linear infinite;
          }

          .laptop404 {
            position: absolute;
            top: 186px;
            left: 9px;
            width: 365px;
            height: 216px;
            background-position: -2px -466px;
            transform-origin: 50% 100%;
            animation: tapWobble 0.4s linear infinite;
          }

          @keyframes sway {
            0% { transform: rotateZ(0deg); }
            20% { transform: rotateZ(0deg); }
            25% { transform: rotateZ(4deg); }
            45% { transform: rotateZ(4deg); }
            50% { transform: rotateZ(0deg); }
            70% { transform: rotateZ(0deg); }
            75% { transform: rotateZ(-4deg); }
            90% { transform: rotateZ(-4deg); }
            100% { transform: rotateZ(0deg); }
          }

          @keyframes headTilt {
            0% { transform: rotateZ(0deg); }
            20% { transform: rotateZ(0deg); }
            25% { transform: rotateZ(-4deg); }
            35% { transform: rotateZ(-4deg); }
            38% { transform: rotateZ(2deg); }
            42% { transform: rotateZ(2deg); }
            45% { transform: rotateZ(-4deg); }
            50% { transform: rotateZ(0deg); }
            70% { transform: rotateZ(0deg); }
            82% { transform: rotateZ(0deg); }
            85% { transform: rotateZ(4deg); }
            90% { transform: rotateZ(4deg); }
            100% { transform: rotateZ(0deg); }
          }

          @keyframes typeLeft {
            0% { transform: rotateZ(0deg); }
            25% { transform: rotateZ(7deg); }
            75% { transform: rotateZ(-6deg); }
            100% { transform: rotateZ(0deg); }
          }

          @keyframes typeRight {
            0% { transform: rotateZ(0deg); }
            25% { transform: rotateZ(-6deg); }
            75% { transform: rotateZ(7deg); }
            100% { transform: rotateZ(0deg); }
          }

          @keyframes tapWobble {
            0% { transform: rotateZ(-0.2deg); }
            50% { transform: rotateZ(0.2deg); }
            100% { transform: rotateZ(-0.2deg); }
          }

          @keyframes tapRight {
            0% { transform: rotateZ(0deg); }
            90% { transform: rotateZ(-6deg); }
            100% { transform: rotateZ(0deg); }
          }

          @keyframes blink404 {
            0% { background-position: -162px -350px; }
            94% { background-position: -162px -350px; }
            98% { background-position: -162px -368px; }
            100% { background-position: -162px -350px; }
          }

          @keyframes pan {
            0% { transform: translateX(-2px); }
            49% { transform: translateX(-2px); }
            50% { transform: translateX(2px); }
            99% { transform: translateX(2px); }
            100% { transform: translateX(-2px); }
          }
        `}</style>
      </div>
    </Layout>
  )
}