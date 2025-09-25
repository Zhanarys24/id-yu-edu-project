'use client'

import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '@/i18n'

export default function YUGamificationComingSoonPage() {
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
      <div className="coming-soon-page">
        <div className="coming-soon-container">
          {/* Заголовки */}
          <div className="coming-soon-header">
            <h1 className="coming-soon-title">
              YU-Геймификация
            </h1>
            <h2 className="coming-soon-subtitle gamification">
              Скоро запуск!
            </h2>
            <p className="coming-soon-description">
              Мы работаем над созданием увлекательной системы геймификации, 
              которая сделает обучение более интересным и мотивирующим.
            </p>
          </div>

          {/* Контент и анимация */}
          <div className="coming-soon-content">
            {/* Анимированный персонаж - скрыт на мобильных */}
            <div className="coming-soon-animation mobile-hidden">
              <div className="character-container">
                <div className="character-animation">
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
            </div>

            {/* Описание функций */}
            <div className="coming-soon-features">
              <div className="features-card">
                <h3 className="features-title">
                  Что будет в YU-Геймификации?
                </h3>
                <div className="features-list">
                  <div className="feature-item">
                    <div className="feature-icon gamification">
                      <div className="feature-dot gamification"></div>
                    </div>
                    <div className="feature-content">
                      <h4 className="feature-title">Система достижений</h4>
                      <p className="feature-description">Получайте награды за выполнение учебных задач</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon gamification">
                      <div className="feature-dot gamification"></div>
                    </div>
                    <div className="feature-content">
                      <h4 className="feature-title">Рейтинги и лидерборды</h4>
                      <p className="feature-description">Соревнуйтесь с другими студентами</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon gamification">
                      <div className="feature-dot gamification"></div>
                    </div>
                    <div className="feature-content">
                      <h4 className="feature-title">Виртуальная валюта</h4>
                      <p className="feature-description">Зарабатывайте и тратьте YU-коины</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon gamification">
                      <div className="feature-dot gamification"></div>
                    </div>
                    <div className="feature-content">
                      <h4 className="feature-title">Квесты и задания</h4>
                      <p className="feature-description">Выполняйте увлекательные задания</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS стили для анимации */}
        <style jsx>{`
          .coming-soon-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
          }

          .coming-soon-container {
            max-width: 1200px;
            width: 100%;
          }

          .coming-soon-header {
            text-align: center;
            margin-bottom: 16px;
          }

          .coming-soon-title {
            font-size: 3.75rem;
            font-weight: 700;
            color: #1f2937;
            margin-top: 20px;
            margin-bottom: 4px;
            line-height: 1;
          }

          .coming-soon-subtitle {
            font-size: 1.875rem;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .coming-soon-subtitle.gamification {
            color: #9333ea;
          }

          .coming-soon-description {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 4px;
            max-width: 32rem;
            margin-left: auto;
            margin-right: auto;
            line-height: 1.5;
          }

          .coming-soon-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }

          .coming-soon-animation {
            flex-shrink: 0;
          }

          .character-container {
            width: 400px;
            height: 800px;
            position: relative;
            transform: scale(0.5);
          }

          .coming-soon-features {
            flex: 1;
            max-width: 32rem;
          }

          .features-card {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }

          .features-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 24px;
          }

          .features-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }

          .feature-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-top: 4px;
          }

          .feature-icon.gamification {
            background-color: #faf5ff;
          }

          .feature-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .feature-dot.gamification {
            background-color: #9333ea;
          }

          .feature-content {
            flex: 1;
          }

          .feature-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }

          .feature-description {
            color: #6b7280;
            font-size: 0.875rem;
            line-height: 1.4;
          }

          /* МОБИЛЬНАЯ АДАПТАЦИЯ */
          @media (max-width: 768px) {
            .coming-soon-page {
              padding: 12px;
            }

            .coming-soon-title {
              font-size: 2.5rem;
              margin-top: 16px;
              margin-bottom: 8px;
            }

            .coming-soon-subtitle {
              font-size: 1.5rem;
              margin-bottom: 8px;
            }

            .coming-soon-description {
              font-size: 1rem;
              margin-bottom: 8px;
              line-height: 1.4;
            }

            .coming-soon-content {
              gap: 16px;
            }

            /* Скрыть анимацию на мобильных */
            .mobile-hidden {
              display: none !important;
            }

            .features-card {
              padding: 20px;
              margin: 0 8px;
            }

            .features-title {
              font-size: 1.25rem;
              margin-bottom: 16px;
            }

            .features-list {
              gap: 12px;
            }

            .feature-item {
              gap: 8px;
            }

            .feature-icon {
              width: 20px;
              height: 20px;
              margin-top: 2px;
            }

            .feature-dot {
              width: 6px;
              height: 6px;
            }

            .feature-title {
              font-size: 0.9rem;
            }

            .feature-description {
              font-size: 0.8rem;
              line-height: 1.3;
            }
          }

          /* Планшеты */
          @media (min-width: 769px) and (max-width: 1024px) {
            .coming-soon-content {
              flex-direction: row;
              align-items: flex-start;
              gap: 24px;
            }

            .character-container {
              transform: scale(0.4);
            }

            .features-card {
              padding: 24px;
            }
          }

          /* Большие экраны */
          @media (min-width: 1025px) {
            .coming-soon-content {
              flex-direction: row;
              align-items: center;
              gap: 32px;
            }

            .character-container {
              transform: scale(0.5);
            }
          }

          /* Анимации персонажа */
          .character-animation {
            width: 400px;
            height: 800px;
            position: relative;
          }

          .character-animation .newcharacter404 {
            width: 400px;
            height: 800px;
            left: 50%;
            top: 20px;
            margin-left: -200px;
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