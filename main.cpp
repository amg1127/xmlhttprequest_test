#include <QCoreApplication>
#include <QFile>
#include <QJSValue>
#include <QQmlEngine>
#include <QTextStream>
#include <QTimer>

class QtRealBridge : public QObject {
    Q_OBJECT
public:
    QJSValue startAllRequests;
    QtRealBridge (QObject* parent = Q_NULLPTR) : QObject (parent) {
    }
public slots:
    void start () {
        qDebug("QtRealBridge::start() invoked.");
    }
    void realStart () {
        qDebug("QtRealBridge::realStart() invoked.");
        this->startAllRequests.call ();
    }
    void finish () {
        qDebug("QtRealBridge::finish() invoked.");
        emit finishRequest ();
    }
    QJSValue ping () {
        qDebug("QtRealBridge::ping() invoked.");
        return (true);
    }
signals:
    void finishRequest ();
};

int main(int argc, char *argv[]) {
    QCoreApplication a(argc, argv);
    qDebug("Starting main program...");
    QQmlEngine* qmlEngine = new QQmlEngine ();
    QtRealBridge* qtRealBridge = new QtRealBridge ();
    QObject::connect (qtRealBridge, &QtRealBridge::finishRequest, &a, &QCoreApplication::quit);
    QJSValue qtRealBridgeValue = qmlEngine->newQObject (qtRealBridge);
    qmlEngine->globalObject().setProperty ("qtRealBridge", qtRealBridgeValue);
    QFile* f = new QFile (":/xmlhttprequest_test.js");
    if (f->open (QIODevice::ReadOnly | QIODevice::Text)) {
        QTextStream* fstream  = new QTextStream (f);
        QString contents (fstream->readAll());
        QJSValue evaluation = qmlEngine->evaluate (contents, "xmlhttprequest_test.js");
        delete (fstream);
        if (evaluation.isError ()) {
            qWarning(QString("Uncaught javascript exception while interpreting the file: %1:%2: %3: %4")
            .arg(evaluation.property("fileName").toString())
            .arg(evaluation.property("lineNumber").toString())
            .arg(evaluation.property("name").toString())
            .arg(evaluation.property("message").toString())
            .toLocal8Bit().constData());
        }
    }
    delete (f);
    qtRealBridge->startAllRequests = qmlEngine->globalObject().property ("startAllRequests");
    QTimer::singleShot (1000, qtRealBridge, &QtRealBridge::realStart);
    qDebug("Main program started. Entering event loop...");
    int returnValue = a.exec();
    qDebug ("Left event loop. Cleaning and finishing...");
    delete (qmlEngine);
    return (returnValue);
}

#include "main.moc"
