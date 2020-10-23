import { locales } from "@replikit/i18n";
import { ReplicaLocale } from "@replica/replica";
import { ChannelType } from "@replikit/core";
import { descriptions } from "@replikit/help";

locales.add("ru", ReplicaLocale, {
    routeAlreadyExists: "Маршрут уже существует",
    routeCreated: "Маршрут создан",
    routes: "Маршруты",
    noRoutesFound: "Маршруты не найдены",
    routeDeleted: "Маршрут удален",
    routeNotFound: "Маршрут не найден",
    hasDuplicates: "В списке каналов есть дубликаты",
    messageFrom: "Сообщение от",
    forwardedFrom: channel =>
        channel.type === ChannelType.PostChannel ? "Переслано из" : "Переслано от",
    totalMessages: "Всего сообщений",
    routeDoesNotContainChannel: "Маршрут не содержит указанный канал",
    routeAlreadyContainsChannel: "Маршрут уже содержит указанный канал",
    routeUpdated: "Маршрут обновлен.",
    invalidMode: "Неправильный режим",
    modeUpdated: "Режим обновлен"
});

descriptions.add("ru", {
    routes: {
        delete: "Удалаляет маршрут",
        exclude: "Исключает канал из маршрута",
        include: "Добавляет канал в маршрут",
        info: "Отображает информацию о маршруте",
        list: "Отображает список маршрутов",
        mode: "Устанавливает режим канала в маршруте",
        sync: "Создает маршрут между каналами"
    }
});
