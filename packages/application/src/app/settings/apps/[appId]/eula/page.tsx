import { Scrollbars } from "@/components/scrollbars";

export default function Page() {
  return (
    <Scrollbars>
      <div className="w-full p-12 m-auto max-w-4xl">
        <h1 className="text-2xl mb-8 font-bold">
          End User License Agreement (EULA)
        </h1>
        <p>
          This End User License Agreement (&ldquo;Agreement&rdquo;) is a legal
          agreement between you (&ldquo;End User&rdquo; or &ldquo;you&rdquo;)
          and Braille (&ldquo;Licensor&rdquo; or &ldquo;we&rdquo;), governing
          your use of the Braille software and any related documentation
          (collectively, the &ldquo;Software&rdquo;).
        </p>
        <div className="mt-12 w-full flex flex-col gap-y-4">
          <div>
            <h2 className="text-lg mb-3 font-semibold">1. License Grant</h2>
            <div>
              <h3 className="font-semibold mt-4">1.1 License:</h3>
              <p>
                Subject to the terms of this Agreement, Licensor grants you a
                non-exclusive, non-transferable, revocable license to use the
                Software solely for your personal or internal business purposes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">1.2 Restrictions:</h3>
              <p>You shall not:</p>
              <ul>
                <li>
                  (a) sublicense, sell, rent, lease, transfer, distribute, or
                  otherwise commercially exploit the Software;
                </li>
                <li>
                  (b) modify, adapt, alter, translate, or create derivative
                  works from the Software;
                </li>
                <li>
                  (c) reverse engineer, decompile, disassemble, or attempt to
                  derive the source code of the Software;
                </li>
                <li>
                  (d) remove, obscure, or alter any proprietary rights notices
                  (including copyright notices) of Licensor on or within the
                  Software.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">2. Ownership</h2>
            <div>
              <h3 className="font-semibold mt-4">2.1 Intellectual Property:</h3>
              <p>
                The Software and all intellectual property rights therein are
                and shall remain the exclusive property of Licensor and its
                licensors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">2.2 Feedback:</h3>
              <p>
                You may provide suggestions, enhancement requests,
                recommendations, or other feedback (&ldquo;Feedback&rdquol;)
                regarding the Software to Licensor. Licensor may use, modify,
                and incorporate the Feedback into the Software without any
                obligation, royalty, or restriction.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              3. Term and Termination
            </h2>
            <div>
              <h3 className="font-semibold mt-4">3.1 Term:</h3>
              <p>
                This Agreement shall commence upon your installation or use of
                the Software and shall continue until terminated as set forth
                herein.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">3.2 Termination:</h3>
              <p>
                Licensor may terminate this Agreement immediately upon notice if
                you breach any provision of this Agreement. Upon termination,
                you shall immediately cease all use of the Software and destroy
                all copies thereof.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              4. Warranty Disclaimer
            </h2>
            <div>
              <h3 className="font-semibold mt-4">4.1 No Warranty:</h3>
              <p>
                THE SOFTWARE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTY OF
                ANY KIND. LICENSOR DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS,
                IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO
                WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
                AND NON-INFRINGEMENT.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              5. Limitation of Liability
            </h2>
            <div>
              <h3 className="font-semibold mt-4">5.1 Limitation:</h3>
              <p>
                IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY
                LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
                INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
                INTANGIBLE LOSSES, ARISING OUT OF YOUR USE OR INABILITY TO USE
                THE SOFTWARE, EVEN IF LICENSOR HAS BEEN ADVISED OF THE
                POSSIBILITY OF SUCH DAMAGES.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">6. Miscellaneous</h2>
            <div>
              <h3 className="font-semibold mt-4">6.1 Governing Law:</h3>
              <p>
                This Agreement shall be governed by and construed in accordance
                with the laws of [Jurisdiction], without regard to its conflict
                of law principles.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">6.2 Entire Agreement:</h3>
              <p>
                This Agreement constitutes the entire agreement between the
                parties regarding the subject matter hereof and supersedes all
                prior or contemporaneous agreements, understandings, and
                communications, whether written or oral.
              </p>
            </div>
          </div>

          <p>
            By installing or using the Software, you acknowledge that you have
            read and understood this Agreement and agree to be bound by its
            terms and conditions.
          </p>
        </div>
      </div>
    </Scrollbars>
  );
}
