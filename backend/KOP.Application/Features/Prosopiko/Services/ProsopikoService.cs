using KOP.Application.Features.Prosopiko.Dtos;
using KOP.Application.Interfaces.Repositories;
using KOP.Application.Interfaces.Services;
using KOP.Domain.Entities;

namespace KOP.Application.Features.Prosopiko.Services;

public sealed class ProsopikoService(IProsopikoRepository prosopikoRepository) : IProsopikoService
{
    public async Task<IReadOnlyList<StelexosTopothetisiDto>> GetProcessedProsopikoMonadasGiaEtosAnaforasAsync(
        int hstrIdMonadas,
        int etosAnaforas,
        CancellationToken cancellationToken)
    {
        // Ανάκτηση προσωπικού Μονάδας, τοποθετήσεών του και αποσπάσεών του από τη ΒΔ.
        var stelexi = await prosopikoRepository.GetProsopikoMeTopothetiseisByMonadaKaiEtosAsync(
            hstrIdMonadas,
            etosAnaforas,
            cancellationToken);

        // Flatten λίστα στελεχών με τοποθετήσεις/αποσπάσεις τους.
        // Τροποποίηση ημερομηνιών παρουσίασης και διαγραφής, ώστε να βρίσκονται στο διάστημα 1/1/<Έτος Αναφοράς> με 31/12/<Έτος Αναφοράς>.
        var topothetiseisKaiApospaseisStoEtos = CreateInitialGrammes(stelexi, etosAnaforas);
        
        // Υπολογίζονται οι πραγματικές ημέρες τοποθέτησης, έχοντας αφαιρεθεί τυχόν ημέρες που το στέλεχος βρισκόταν σε απόσπαση.
        // Επιστρέφονται όλες οι γραμμές, τόσο με Τοποθετήσεις, όσο και με Αποσπάσεις.
        var result = AfairesiImeronApospaseonApoTopothetiseis(topothetiseisKaiApospaseisStoEtos);

        //
        // TODO: Apothikefsi sti vasi dedomenon.
        //

        return result;
    }

    private static List<StelexosTopothetisiDto> CreateInitialGrammes(IReadOnlyList<Stelexos> stelexi, int etosAnaforas)
    {
        /*
         * Αρχικά κάνει flattened τη λίστα με τα στελέχη και τις τοποθετήσεις/αποσπάσεις τους.
         * Τροποποιεί όλες τις ημερομηνίες παρουσίασης και διαγραφής, ώστε να βρίσκονται στο διάστημα 1/1/<Έτος Αναφοράς> με 31/12/<Έτος Αναφοράς>.
         */ 
        
        var startOfYear = new DateTime(etosAnaforas, 1, 1);
        var endOfYear = new DateTime(etosAnaforas, 12, 31);

        return stelexi
            .SelectMany(stelexos => stelexos.Topothetiseis
                .Select(topothetisi =>
                {
                    var dateParousiasisEtous =
                        topothetisi.DateParousiasis.Date < startOfYear
                            ? startOfYear
                            : topothetisi.DateParousiasis.Date;

                    var dateDiagrafis =
                        topothetisi.DateDiagrafis?.Date ?? endOfYear;

                    var dateDiagrafisEtous =
                        dateDiagrafis > endOfYear
                            ? endOfYear
                            : dateDiagrafis;

                    var imeres = (dateDiagrafisEtous - dateParousiasisEtous).Days + 1;

                    return new StelexosTopothetisiDto
                    {
                        PebadaId = stelexos.PebadaId,
                        Rank = stelexos.Rank,
                        Eidik = stelexos.Eidik,
                        Onoma = stelexos.Onoma,
                        Eponymo = stelexos.Eponymo,
                        Ama = stelexos.Ama,

                        HstrId = topothetisi.HstrId,
                        HstrTitle = topothetisi.HstrTitle,

                        HstrIdMonadas = topothetisi.HstrIdMonadas,
                        HstrTitleMonadas = topothetisi.HstrTitleMonadas,

                        DateParousiasisEtous = dateParousiasisEtous,
                        DateDiagrafisEtous = dateDiagrafisEtous,

                        Imeres = imeres,

                        EinaiApospasi = topothetisi.EinaiApospasi,
                        ApospasiSe = topothetisi.ApospasiSe,
                        ApospasiSeTitle = topothetisi.ApospasiSeTitle,
                    };
                }))
            .ToList();
    }

    private static List<StelexosTopothetisiDto> AfairesiImeronApospaseonApoTopothetiseis(List<StelexosTopothetisiDto> topothetiseisKaiApospaseisStoEtos)
    {
        /*
         * Υπολογίζονται οι πραγματικές ημέρες τοποθέτησης, έχοντας αφαιρεθεί τυχόν ημέρες που το στέλεχος βρισκόταν σε απόσπαση.
         * Επιστρέφονται όλες οι γραμμές, τόσο με Τοποθετήσεις, όσο και με Αποσπάσεις.
         */
        
        return topothetiseisKaiApospaseisStoEtos
            .GroupBy(x => x.PebadaId)
            .SelectMany(group =>
            {
                var topothetiseis = group
                    .Where(x => !x.EinaiApospasi)
                    .ToList();

                var apospaseis = group
                    .Where(x => x.EinaiApospasi)
                    .ToList();

                foreach (var topothetisi in topothetiseis)
                {
                    var relevantApospaseis = apospaseis
                        .Where(apospasi =>
                            apospasi.DateParousiasisEtous >= topothetisi.DateParousiasisEtous &&
                            apospasi.DateDiagrafisEtous <= topothetisi.DateDiagrafisEtous)
                        .ToList();

                    var imeresApospaseon = relevantApospaseis
                        .Sum(apospasi => apospasi.Imeres);

                    topothetisi.Imeres = Math.Max(
                        0,
                        topothetisi.Imeres - imeresApospaseon);

                    topothetisi.ExeiApospaseisStoDiastimaTopothetisis = imeresApospaseon > 0;
                }

                return group;
            })
            .OrderBy(x => x.Eponymo)
            .ThenBy(x => x.Onoma)
            .ThenBy(x => x.DateParousiasisEtous)
            .ToList();
    }

}