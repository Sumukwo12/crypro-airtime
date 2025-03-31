<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($pageTitle) ? $pageTitle . ' - ' . SITE_NAME : SITE_NAME ?></title>
    <link rel="stylesheet" href="assets/css/styles.css">
    <!-- Use correct and reliable CDN URLs -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/web3/1.8.2/web3.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.umd.min.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1><?= SITE_NAME ?></h1>
            <nav>
                <ul>
                    <li><a href="index.php">Home</a></li>
                    <li><a href="test.php">Test</a></li>
                </ul>
            </nav>
        </header>
        <main>